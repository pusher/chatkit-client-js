import { urlEncode, mergeQueryParamsIntoUrl } from './utils';

export interface TokenProviderAuthContextOptions {
  queryParams?: TokenProviderAuthContextQueryParams;
  headers?: TokenProviderAuthContextHeaders;
}

export type TokenProviderAuthContextHeaders = {
  [key: string]: string;
}

export type TokenProviderAuthContextQueryParams = {
  [key: string]: string;
}

export interface TokenProviderOptions {
  authContext?: TokenProviderAuthContextOptions;
  url: string;
  userId?: string;
}

export default class TokenProvider {
  authContext?: TokenProviderAuthContextOptions;
  url: string;
  userId?: string;

  cachedAccessToken?: string;
  cachedTokenExpiresAt?: number;

  constructor(options: TokenProviderOptions) {
    this.authContext = options.authContext || {};
    this.url = options.url;
    this.userId = options.userId;
  }

  get cacheIsStale() {
    return !this.cachedAccessToken || this.unixTimeNow() > this.cachedTokenExpiresAt;
  }

  fetchToken(tokenParams?: any): Promise<string> {
    if (this.cacheIsStale) {
      return this.makeAuthRequest().then(responseBody => {
        const { access_token, expires_in } = responseBody;
        this.cache(access_token, expires_in);
        return access_token;
      });
    }
    return new Promise<string>((onCancel, resolve, reject) => {
      resolve(this.cachedAccessToken);
    })
  }

  clearToken(token?: string) {
    this.cachedAccessToken = undefined;
    this.cachedTokenExpiresAt = undefined;
  }

  makeAuthRequest(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const xhr = new global.XMLHttpRequest();
      var url;
      if (this.userId === undefined) {
        url = mergeQueryParamsIntoUrl(this.url, this.authContext.queryParams);
      } else {
        const authContextWithUserId = Object.assign(
          {},
          this.authContext.queryParams,
          { user_id: this.userId },
        );
        url = mergeQueryParamsIntoUrl(this.url, authContextWithUserId);
      }

      xhr.open("POST", url);
      if (this.authContext.headers !== undefined) {
        Object.keys(this.authContext.headers).forEach(key => {
          xhr.setRequestHeader(key, this.authContext.headers[key]);
        });
      }
      xhr.timeout = 30 * 1000; // 30 seconds
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Couldn't fetch token from ${
            this.url
          }; got ${ xhr.status } ${ xhr.statusText }.`));
        }
      };
      xhr.ontimeout = () => {
        reject(new Error(`Request timed out while fetching token from ${
          this.url
        }`));
      };
      xhr.onerror = error => {
        reject(error);
      };
      xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
      xhr.send(urlEncode({
        grant_type: "client_credentials",
      }));
    });
  }

  private cache(accessToken: string, expiresIn: number) {
    this.cachedAccessToken = accessToken;
    this.cachedTokenExpiresAt = this.unixTimeNow() + expiresIn;
  }

  private unixTimeNow(): number {
    return Math.floor(Date.now() / 1000);
  }
}

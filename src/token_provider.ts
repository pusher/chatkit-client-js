import { sendRawRequest } from 'pusher-platform';

import { mergeQueryParamsIntoUrl, urlEncode } from './utils';

export interface TokenProviderAuthContextOptions {
  queryParams?: TokenProviderAuthContextQueryParams;
  headers?: TokenProviderAuthContextHeaders;
}

export type TokenProviderAuthContextHeaders = {
  [key: string]: string;
};

export type TokenProviderAuthContextQueryParams = {
  [key: string]: string;
};

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
    return (
      !this.cachedAccessToken || this.unixTimeNow() > this.cachedTokenExpiresAt
    );
  }

  fetchToken(tokenParams?: any): Promise<string> {
    if (this.cacheIsStale) {
      return this.makeAuthRequest().then(responseBody => {
        const { access_token, expires_in } = responseBody;
        this.cache(access_token, expires_in);
        return access_token;
      });
    }
    return new Promise<string>((resolve, reject) => {
      resolve(this.cachedAccessToken);
    });
  }

  clearToken(token?: string) {
    this.cachedAccessToken = undefined;
    this.cachedTokenExpiresAt = undefined;
  }

  makeAuthRequest(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let url;

      if (this.userId === undefined) {
        url = mergeQueryParamsIntoUrl(this.url, this.authContext.queryParams);
      } else {
        const authContextWithUserId = {
          user_id: this.userId,
          ...this.authContext.queryParams,
        };
        url = mergeQueryParamsIntoUrl(this.url, authContextWithUserId);
      }

      const headers = {
        ['Content-Type']: 'application/x-www-form-urlencoded',
        ...this.authContext.headers,
      };

      const body = urlEncode({ grant_type: 'client_credentials' });

      sendRawRequest({
        body,
        headers,
        method: 'POST',
        url,
      })
        .then(res => {
          resolve(JSON.parse(res));
        })
        .catch(error => {
          reject(
            new Error(`Couldn't fetch token from ${this.url}; error: ${error}`),
          );
        });
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

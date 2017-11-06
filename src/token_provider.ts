import * as PCancelable from 'p-cancelable';

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
  url: string;
  userId?: string;
  authContext?: TokenProviderAuthContextOptions;
}

export default class TokenProvider {
  url: string;
  userId?: string;
  authContext?: TokenProviderAuthContextOptions;

  constructor(options: TokenProviderOptions) {
    this.url = options.url;
    this.userId = options.userId;
    this.authContext = options.authContext || {};
  }

  fetchToken(tokenParams?: any): PCancelable<string> {
    return this.makeAuthRequest().then(responseBody => {
      return responseBody.access_token;
    });
  }

  clearToken(token?: string) {
    // TODO: Caching
  }

  makeAuthRequest(): PCancelable<string> {
    return new PCancelable<string>((onCancel, resolve, reject) => {
      const xhr = new XMLHttpRequest();
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

  private unixTimeNow(): number {
    return Math.floor(Date.now() / 1000);
  }
}

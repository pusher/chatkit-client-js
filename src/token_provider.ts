import {
  sendRawRequest,
  TokenProvider as PlatformTokenProvider,
} from 'pusher-platform';

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
}

export default class TokenProvider implements PlatformTokenProvider {
  authContext?: TokenProviderAuthContextOptions;
  url: string;
  userId?: string;

  cachedAccessToken?: string;
  cachedTokenExpiresAt?: number;

  constructor(options: TokenProviderOptions) {
    this.authContext = options.authContext || {};
    this.url = options.url;
  }

  get cacheIsStale() {
    if (this.cachedAccessToken && this.cachedTokenExpiresAt) {
      return this.unixTimeNow() > this.cachedTokenExpiresAt;
    }
    return true;
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
    let url;

    const authRequestQueryParams = (this.authContext || {}).queryParams || {};

    if (this.userId === undefined) {
      url = mergeQueryParamsIntoUrl(this.url, authRequestQueryParams);
    } else {
      const authContextWithUserId = {
        user_id: this.userId,
        ...authRequestQueryParams,
      };
      url = mergeQueryParamsIntoUrl(this.url, authContextWithUserId);
    }

    const authRequestHeaders = (this.authContext || {}).headers || {};

    const headers = {
      ['Content-Type']: 'application/x-www-form-urlencoded',
      ...authRequestHeaders,
    };

    const body = urlEncode({ grant_type: 'client_credentials' });

    return sendRawRequest({
      body,
      headers,
      method: 'POST',
      url,
    }).then((res: any) => {
      return JSON.parse(res);
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

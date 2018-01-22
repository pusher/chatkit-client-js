import { TokenProvider as PlatformTokenProvider } from 'pusher-platform';
export interface TokenProviderAuthContextOptions {
    queryParams?: TokenProviderAuthContextQueryParams;
    headers?: TokenProviderAuthContextHeaders;
}
export declare type TokenProviderAuthContextHeaders = {
    [key: string]: string;
};
export declare type TokenProviderAuthContextQueryParams = {
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
    constructor(options: TokenProviderOptions);
    readonly cacheIsStale: boolean;
    fetchToken(tokenParams?: any): Promise<string>;
    clearToken(token?: string): void;
    makeAuthRequest(): Promise<any>;
    private cache(accessToken, expiresIn);
    private unixTimeNow();
}

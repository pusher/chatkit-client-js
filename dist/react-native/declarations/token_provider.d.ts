import * as PCancelable from 'p-cancelable';
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
    url: string;
    userId?: string;
    authContext?: TokenProviderAuthContextOptions;
}
export default class TokenProvider {
    url: string;
    userId?: string;
    authContext?: TokenProviderAuthContextOptions;
    constructor(options: TokenProviderOptions);
    fetchToken(tokenParams?: any): PCancelable<string>;
    clearToken(token?: string): void;
    makeAuthRequest(): PCancelable<string>;
    private unixTimeNow();
}

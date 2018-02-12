export declare function urlEncode(data: any): string;
export declare function queryString(data: any): string;
export declare function queryParamsFromFullUrl(url: string): any;
export declare function mergeQueryParamsIntoUrl(urlString: string, queryParams: any): string;
export declare function allPromisesSettled(promises: Array<Promise<any>>): Promise<any>;

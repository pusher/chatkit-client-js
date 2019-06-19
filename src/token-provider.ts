import { sendRawRequest, TokenProvider as PlatformTokenProvider } from "@pusher/platform"

import { appendQueryParams, unixSeconds, urlEncode } from "./utils"

export class TokenProvider implements PlatformTokenProvider {
  public userId?: string;
  private url: string;
  private queryParams: any;
  private headers?: { [header: string]: any };
  private withCredentials: boolean;

  private cachedToken?: string;
  private cacheExpiresAt: number = 0;
  private req?: Promise<{ token: any; expiresIn: any; }>
  
  public constructor({url, queryParams, headers, withCredentials}: {
    url: string,
    queryParams?: any,
    headers?: { [header: string]: string },
    withCredentials?: boolean }) 
  {
    this.url = url
    this.queryParams = queryParams
    this.headers = headers
    this.withCredentials = withCredentials || false

    this.fetchToken = this.fetchToken.bind(this)
    this.fetchFreshToken = this.fetchFreshToken.bind(this)
    this.cacheIsStale = this.cacheIsStale.bind(this)
    this.cache = this.cache.bind(this)
    this.clearCache = this.clearCache.bind(this)
    this.setUserId = this.setUserId.bind(this)
  }

  // Interface implementation, currently unused.
  public clearToken() {

  }

  public fetchToken() {
    return !this.cacheIsStale()
      ? Promise.resolve(this.cachedToken)
      : (this.req || this.fetchFreshToken())!.then(({ token, expiresIn }) => {
          this.cache(token, expiresIn)
          return token
        })
  }

  public fetchFreshToken() {
    this.req = sendRawRequest({
      method: "POST",
      url: appendQueryParams(
        { user_id: this.userId, ...this.queryParams },
        this.url,
      ),
      body: urlEncode({ grant_type: "client_credentials" }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        ...this.headers,
      },
      withCredentials: this.withCredentials,
    })
      .then((res: any) => {
        const { access_token: token, expires_in: expiresIn } = JSON.parse(res)
        delete this.req
        return { token, expiresIn }
      })
      .catch((err: any) => {
        delete this.req
        throw err
      })
    return this.req
  }

  private cacheIsStale() {
    return !this.cachedToken || unixSeconds() > this.cacheExpiresAt
  }

  private cache(token: string, expiresIn: number) {
    this.cachedToken = token
    this.cacheExpiresAt = unixSeconds() + expiresIn
  }

  private clearCache() {
    this.cachedToken = undefined
    this.cacheExpiresAt = 0
  }

  // To allow ChatManager to feed the userId to the TokenProvider. Not set
  // directly so as not to mess with a custom TokenProvider implementation.
  public setUserId(userId: string) {
    this.clearCache()
    this.userId = userId
  }
}

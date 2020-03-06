import { sendRawRequest } from "@pusher/platform"
import {
  appendQueryParams,
  typeCheckStringOrFunction,
  typeCheckObjectOrFunction,
  unixSeconds,
  urlEncode,
} from "./utils"

export class TokenProvider {
  constructor({ url, queryParams, headers, withCredentials } = {}) {
    typeCheckStringOrFunction("url", url)
    queryParams && typeCheckObjectOrFunction("queryParams", queryParams)
    headers && typeCheckObjectOrFunction("headers", headers)
    this.url = url
    this.queryParams = queryParams
    this.headers = headers
    this.withCredentials = withCredentials

    this.fetchToken = this.fetchToken.bind(this)
    this.fetchFreshToken = this.fetchFreshToken.bind(this)
    this.cacheIsStale = this.cacheIsStale.bind(this)
    this.cache = this.cache.bind(this)
    this.clearCache = this.clearCache.bind(this)
    this.setUserId = this.setUserId.bind(this)
  }

  getValueOrFunction(value) {
    return new Promise(resolve => {
      if (typeof value === "function") {
        resolve(value())
      } else {
        resolve(value)
      }
    })
  }

  fetchToken() {
    return !this.cacheIsStale()
      ? Promise.resolve(this.cachedToken)
      : (this.req || this.fetchFreshToken()).then(({ token, expiresIn }) => {
          this.cache(token, expiresIn)
          return token
        })
  }

  fetchFreshToken() {
    this.req = Promise.all([
      this.getValueOrFunction(this.url),
      this.getValueOrFunction(this.queryParams),
      this.getValueOrFunction(this.headers),
    ])
      .then(([url, queryParams, headers]) => {
        return sendRawRequest({
          method: "POST",
          url: appendQueryParams({ user_id: this.userId, ...queryParams }, url),
          body: urlEncode({ grant_type: "client_credentials" }),
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            ...headers,
          },
          withCredentials: this.withCredentials,
        })
      })
      .then(res => {
        const { access_token: token, expires_in: expiresIn } = JSON.parse(res)
        delete this.req
        return { token, expiresIn }
      })
      .catch(err => {
        delete this.req
        throw err
      })
    return this.req
  }

  cacheIsStale() {
    return !this.cachedToken || unixSeconds() > this.cacheExpiresAt
  }

  cache(token, expiresIn) {
    this.cachedToken = token
    this.cacheExpiresAt = unixSeconds() + expiresIn
  }

  clearCache() {
    this.cachedToken = undefined
    this.cacheExpiresAt = undefined
  }

  // To allow ChatManager to feed the userId to the TokenProvider. Not set
  // directly so as not to mess with a custom TokenProvider implementation.
  setUserId(userId) {
    this.clearCache()
    this.userId = userId
  }
}

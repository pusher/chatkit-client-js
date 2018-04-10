import { sendRawRequest } from 'pusher-platform'

import { appendQueryParams, typeCheck, unixSeconds, urlEncode } from './utils'

export class TokenProvider {
  constructor ({ url, queryParams, headers } = {}) {
    typeCheck('url', 'string', url)
    queryParams && typeCheck('queryParams', 'object', queryParams)
    headers && typeCheck('headers', 'object', headers)
    this.url = url
    this.queryParams = queryParams
    this.headers = headers
  }

  fetchToken = () => !this.cacheIsStale()
    ? Promise.resolve(this.cachedToken)
    : (this.req || this.fetchFreshToken()).then(({ token, expiresIn }) => {
      this.cache(token, expiresIn)
      return token
    })

  fetchFreshToken = () => {
    this.req = sendRawRequest({
      method: 'POST',
      url: appendQueryParams(
        { user_id: this.userId, ...this.queryParams },
        this.url
      ),
      body: urlEncode({ grant_type: 'client_credentials' }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        ...this.headers
      }
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

  cacheIsStale = () => !this.cachedToken || unixSeconds() > this.cacheExpiresAt

  cache = (token, expiresIn) => {
    this.cachedToken = token
    this.cacheExpiresAt = unixSeconds() + expiresIn
  }

  clearCache = () => {
    this.cachedToken = undefined
    this.cacheExpiresAt = undefined
  }

  // To allow ChatManager to feed the userId to the TokenProvider. Not set
  // directly so as not to mess with a custom TokenProvider implementation.
  setUserId = userId => {
    this.clearCache()
    this.userId = userId
  }
}

import { sendRawRequest } from 'pusher-platform'

import { appendQueryParam, typeCheck, unixSeconds, urlEncode } from './utils'

export class TokenProvider {
  // TODO authContext
  constructor ({ url } = {}) {
    typeCheck('url', 'string', url)
    this.url = url
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
      url: appendQueryParam('user_id', this.userId, this.url),
      body: urlEncode({ grant_type: 'client_credentials' }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
      .then(res => {
        const { access_token: token, expires_in: expiresIn } = JSON.parse(res)
        this.req = undefined
        return { token, expiresIn }
      })
      .catch(err => {
        this.req = undefined
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

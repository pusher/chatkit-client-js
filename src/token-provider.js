import { sendRawRequest } from 'pusher-platform'

import { urlEncode, appendQueryParam, typeCheck } from './utils'

export class TokenProvider {
  // TODO authContext
  constructor ({ url } = {}) {
    typeCheck('url', 'string', url)
    this.url = url
  }

  // TODO caching
  fetchToken () {
    return sendRawRequest({
      body: urlEncode({ grant_type: 'client_credentials' }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      url: appendQueryParam('user_id', this.userId, this.url)
    }).then(res => JSON.parse(res).access_token)
  }

  // To allow ChatManager to feed the userId to the TokenProvider. Not set
  // directly so as not to mess with a custom TokenProvider implementation.
  setUserId (userId) {
    this.userId = userId
  }
}

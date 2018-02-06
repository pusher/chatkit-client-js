import { BaseClient, HOST_BASE, Instance } from 'pusher-platform'
import { split } from 'ramda'

import { CurrentUser } from './current-user'
import { typeCheck, typeCheckObj } from './utils'

export class ChatManager {
  // TODO accept a tokenProviderUrl and create a default tokenProvider?
  constructor ({ instanceLocator, tokenProvider, userId, ...options } = {}) {
    typeCheck('instanceLocator', 'string', instanceLocator)
    typeCheck('tokenProvider', 'object', tokenProvider)
    typeCheck('tokenProvider.fetchToken', 'function', tokenProvider.fetchToken)
    typeCheck('userId', 'string', userId)
    const cluster = split(':', instanceLocator)[1]
    if (cluster === undefined) {
      throw new TypeError(
        `expected instanceLocator to be of the format x:y:z, but was ${instanceLocator}`
      )
    }
    const baseClient = options.baseClient || new BaseClient({
      host: `${cluster}.${HOST_BASE}`,
      logger: options.logger
    })
    if (typeof tokenProvider.setUserId === 'function') {
      tokenProvider.setUserId(userId)
    }
    const instanceOptions = {
      client: baseClient,
      locator: instanceLocator,
      logger: options.logger,
      tokenProvider
    }
    this.apiInstance = new Instance({
      serviceName: 'chatkit',
      serviceVersion: 'v1',
      ...instanceOptions
    })
    this.filesInstance = new Instance({
      serviceName: 'chatkit_files',
      serviceVersion: 'v1',
      ...instanceOptions
    })
    this.cursorsInstance = new Instance({
      serviceName: 'chatkit_cursors',
      serviceVersion: 'v1',
      ...instanceOptions
    })
    this.userId = userId
  }

  connect (hooks = {}) {
    typeCheckObj('function', hooks)
    const currentUser = new CurrentUser({
      id: this.userId,
      apiInstance: this.apiInstance
    })
    return Promise.all([
      currentUser.establishUserSubscription(hooks)
        .then(currentUser.initializeUserStore),
      currentUser.establishPresenceSubscription(hooks)
      // currentUser.initializeCursorStore()
    ]).then(() => currentUser)
  }
}

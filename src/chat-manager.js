import { BaseClient, HOST_BASE, Instance } from 'pusher-platform'
import { split } from 'ramda'

import { CurrentUser } from './current-user'
import { typeCheck, typeCheckObj } from './utils'

import { version } from '../package.json'

export class ChatManager {
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
      logger: options.logger,
      sdkProduct: 'chatkit',
      sdkVersion: version
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
    this.presenceInstance = new Instance({
      serviceName: 'chatkit_presence',
      serviceVersion: 'v1',
      ...instanceOptions
    })
    this.userId = userId
  }

  connect = (hooks = {}) => {
    typeCheckObj('hooks', 'function', hooks)
    const currentUser = new CurrentUser({
      hooks,
      id: this.userId,
      apiInstance: this.apiInstance,
      filesInstance: this.filesInstance,
      cursorsInstance: this.cursorsInstance,
      presenceInstance: this.presenceInstance
    })
    return Promise.all([
      currentUser.establishUserSubscription(),
      currentUser.establishPresenceSubscription(),
      currentUser.establishCursorSubscription()
    ]).then(() => {
      this.currentUser = currentUser
      return currentUser
    })
  }

  disconnect = () => { if (this.currentUser) this.currentUser.disconnect() }
}

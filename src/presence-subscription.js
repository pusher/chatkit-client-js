export class PresenceSubscription {
  constructor (options) {
    this.userId = options.userId
    this.instance = options.instance
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error('presence subscription timed out'))
      }, this.connectionTimeout)
      this.sub = this.instance.subscribeNonResuming({
        path: `/users/${encodeURIComponent(this.userId)}/register`,
        listeners: {
          onOpen: () => {
            clearTimeout(this.timeout)
            resolve()
          },
          onError: err => {
            clearTimeout(this.timeout)
            reject(err)
          }
        }
      })
    })
  }

  cancel () {
    clearTimeout(this.timeout)
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug('error when cancelling presence subscription', err)
    }
  }
}

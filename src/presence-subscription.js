export class PresenceSubscription {
  constructor (options) {
    this.userId = options.userId
    this.instance = options.instance
    this.logger = options.logger
  }

  registerAsOnline () {
    return new Promise((resolve, reject) => {
      this.sub = this.instance.subscribeNonResuming({
        path: `/users/${encodeURIComponent(this.userId)}/register`,
        listeners: {
          onError: reject,
          onOpen: resolve
        }
      })
    })
  }

  // TODO: Hook for when CurrentUser is online?

  cancel () {
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug('error when cancelling presence subscription', err)
    }
  }
}

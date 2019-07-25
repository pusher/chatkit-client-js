export class NotificationSubscription {
  constructor(options) {
    this.onNotificationHook = options.onNotificationHook
    this.userId = options.userId
    this.instance = options.instance
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout

    this.connect = this.connect.bind(this)
    this.cancel = this.cancel.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.onNotification = this.onNotification.bind(this)
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("notification subscription timed out"))
      }, this.connectionTimeout)
      this.sub = this.instance.subscribeNonResuming({
        path: `/users/${encodeURIComponent(this.userId)}`,
        listeners: {
          onOpen: () => {
            clearTimeout(this.timeout)
            resolve()
          },
          onError: err => {
            clearTimeout(this.timeout)
            reject(err)
          },
          onEvent: this.onEvent,
        },
      })
    })
  }

  cancel() {
    clearTimeout(this.timeout)
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug("error when cancelling notification subscription", err)
    }
  }

  onEvent({ body }) {
    switch (body.event_name) {
      case "push_notification":
        this.onNotification(body.data)
        break
    }
  }

  onNotification(data) {
    this.onNotificationHook(data)
  }
}

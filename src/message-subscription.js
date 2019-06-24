import { parseBasicMessage } from "./parsers"
import { urlEncode } from "./utils"
import { Message } from "./message"

export class MessageSubscription {
  constructor(options) {
    this.roomId = options.roomId
    this.messageLimit = options.messageLimit
    this.userId = options.userId
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.typingIndicators = options.typingIndicators
    this.messageBuffer = [] // { message, ready }
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout
    this.onMessageHook = options.onMessageHook
    this.onMessageDeletedHook = options.onMessageDeletedHook

    this.connect = this.connect.bind(this)
    this.cancel = this.cancel.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.onMessage = this.onMessage.bind(this)
    this.onMessageDeleted = this.onMessageDeleted.bind(this)
    this.flushBuffer = this.flushBuffer.bind(this)
    this.onIsTyping = this.onIsTyping.bind(this)
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("message subscription timed out"))
      }, this.connectionTimeout)
      this.sub = this.instance.subscribeResuming({
        path: `/rooms/${encodeURIComponent(this.roomId)}?${urlEncode({
          message_limit: this.messageLimit,
        })}`,
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
      this.logger.debug("error when cancelling message subscription", err)
    }
  }

  onEvent({ body }) {
    switch (body.event_name) {
      case "new_message":
        this.onMessage(body.data)
        break
      case "message_deleted":
        this.onMessageDeleted(body.data)
        break
      case "is_typing":
        this.onIsTyping(body.data)
        break
    }
  }

  onMessage(data) {
    const pending = {
      message: new Message(
        parseBasicMessage(data),
        this.userStore,
        this.roomStore,
        this.instance,
      ),
      ready: false,
    }
    this.messageBuffer.push(pending)
    this.userStore
      .fetchMissingUsers([pending.message.senderId])
      .catch(err => {
        this.logger.error("error fetching missing user information:", err)
      })
      .then(() => {
        pending.ready = true
        this.flushBuffer()
      })
  }

  onMessageDeleted(data) {
    this.onMessageDeletedHook(data.message_id)
  }

  flushBuffer() {
    while (this.messageBuffer.length > 0 && this.messageBuffer[0].ready) {
      this.onMessageHook(this.messageBuffer.shift().message)
    }
  }

  onIsTyping({ user_id: userId }) {
    if (userId !== this.userId) {
      Promise.all([
        this.roomStore.get(this.roomId),
        this.userStore.get(userId),
      ]).then(([room, user]) => this.typingIndicators.onIsTyping(room, user))
    }
  }
}

import { head, isEmpty } from 'ramda'

import { parseBasicMessage } from './parsers'
import { urlEncode } from './utils'
import { Message } from './message'

export class MessageSubscription {
  constructor (options) {
    this.roomId = options.roomId
    this.hooks = options.hooks
    this.messageLimit = options.messageLimit
    this.userId = options.userId
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.messageBuffer = [] // { message, ready }
    this.logger = options.logger
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.sub = this.instance.subscribeResuming({
        path: `/rooms/${this.roomId}?${urlEncode({
          message_limit: this.messageLimit
        })}`,
        listeners: {
          onOpen: resolve,
          onError: reject,
          onEvent: this.onEvent
        }
      })
    })
  }

  cancel () {
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug('error when cancelling message subscription', err)
    }
  }

  onEvent = ({ body }) => {
    switch (body.event_name) {
      case 'new_message':
        this.onNewMessage(body.data)
        break
    }
  }

  onNewMessage = data => {
    const pending = {
      message: new Message(
        parseBasicMessage(data),
        this.userStore,
        this.roomStore
      ),
      ready: false
    }
    this.messageBuffer.push(pending)
    this.userStore.fetchMissingUsers([pending.message.senderId])
      .catch(err => {
        this.logger.error('error fetching missing user information:', err)
      })
      .then(() => {
        pending.ready = true
        this.flushBuffer()
      })
  }

  flushBuffer = () => {
    while (!isEmpty(this.messageBuffer) && head(this.messageBuffer).ready) {
      const message = this.messageBuffer.shift().message
      if (
        this.hooks.rooms[this.roomId] &&
        this.hooks.rooms[this.roomId].onNewMessage
      ) {
        this.hooks.rooms[this.roomId].onNewMessage(message)
      }
    }
  }
}

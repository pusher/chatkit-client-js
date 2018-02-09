import { head, isEmpty } from 'ramda'

import { parseBasicMessage } from './parsers'
import { urlEncode } from './utils'
import { Message } from './message'

export class RoomSubscription {
  constructor (options) {
    this.roomId = options.roomId
    this.hooks = options.hooks
    this.messageLimit = options.messageLimit
    this.userId = options.userId
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.messageBuffer = [] // { message, ready }
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.instance.subscribeNonResuming({
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
    this.userStore.fetchMissingUsers([pending.message.senderId]).then(() => {
      pending.ready = true
      this.flushBuffer()
    })
  }

  flushBuffer = () => {
    while (!isEmpty(this.messageBuffer) && head(this.messageBuffer).ready) {
      if (this.hooks.newMessage) {
        this.hooks.newMessage(this.messageBuffer.shift().message)
      }
    }
  }
}

import {
  compose,
  contains,
  filter,
  forEach,
  indexBy,
  map,
  prop,
  toPairs
} from 'ramda'

import { parsePresence } from './parsers'

export class UserPresenceSubscription {
  constructor (options) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.presenceStore = options.presenceStore
    this.logger = options.logger
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.sub = this.instance.subscribeNonResuming({
        path: `/users/${encodeURIComponent(this.userId)}`,
        listeners: {
          onError: reject,
          onEvent: this.onEvent,
          onOpen: resolve,
        }
      })
    })
  }

  cancel () {
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug('error when cancelling user presence subscription', err)
    }
  }

  onEvent = ({ body }) => {
    switch (body.event_name) {
      case 'presence_state':
        this.onPresenceState(body.data)
        break
    }
  }

  onPresenceState = data => {
    const presence = parsePresence(data)
    this.presenceStore.set(this.userId, presence)
      .then(p => this.userStore.get(this.userId)
        .then(user => {
          switch (p.state) {
            case 'online':
              this.onCameOnline(user)
              break
            case 'offline':
              this.onWentOffline(user)
              break
          }
        })
    )
  }

  onCameOnline = user => this.callRelevantHooks('onUserCameOnline', user)

  onWentOffline = user => this.callRelevantHooks('onUserWentOffline', user)

  callRelevantHooks = (hookName, user) => {
    if (this.hooks.global[hookName]) {
      this.hooks.global[hookName](user)
    }
    compose(
      forEach(([roomId, hooks]) => this.roomStore.get(roomId).then(room => {
        if (contains(user.id, room.userIds)) {
          hooks[hookName](user)
        }
      })),
      filter(([roomId, hooks]) => hooks[hookName] !== undefined),
      toPairs
    )(this.hooks.rooms)
  }
}

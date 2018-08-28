import { contains, compose, forEach, filter, toPairs } from 'ramda'

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
    this.connectionTimeout = options.connectionTimeout
  }

  connect () {
    console.log('ESTABLISHING PRESENCE SUB FOR', this.userId)
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error('user presence subscription timed out'))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = () => {
        clearTimeout(this.timeout)
        resolve()
      }
      this.sub = this.instance.subscribeNonResuming({
        path: `/users/${encodeURIComponent(this.userId)}`,
        listeners: {
          onError: err => {
            clearTimeout(this.timeout)
            reject(err)
          },
          onEvent: this.onEvent
        }
      })
    })
  }

  cancel () {
    clearTimeout(this.timeout)
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
    this.onSubscriptionEstablished()
    const previous = this.presenceStore.getSync(this.userId) || 'unknown'
    const current = parsePresence(data).state
    if (current === previous) {
      return
    }
    this.presenceStore.set(this.userId, current).then(() => {
      this.userStore.get(this.userId).then(user => {
        if (this.hooks.global.onPresenceChanged) {
          this.hooks.global.onPresenceChanged({ current, previous }, user)
        }
        compose(
          forEach(([roomId, hooks]) => this.roomStore.get(roomId).then(room => {
            if (contains(user.id, room.userIds)) {
              hooks.onPresenceChanged({ current, previous }, user)
            }
          })),
          filter(([roomId, hooks]) => hooks.onPresenceChanged !== undefined),
          toPairs
        )(this.hooks.rooms)
      })
    })
  }
}

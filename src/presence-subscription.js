import { indexBy, prop, map } from 'ramda'

import { parsePresenceState } from './parsers'

export class PresenceSubscription {
  constructor (options) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.userStore = options.userStore
    this.presenceStore = options.presenceStore
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.hooks = { ...this.hooks, subscriptionEstablished: resolve }
      this.instance.subscribeNonResuming({
        path: `/users/${this.userId}/presence`,
        listeners: {
          onError: reject,
          onEvent: this.onEvent
        }
      })
    })
  }

  onEvent = ({ body }) => {
    switch (body.event_name) {
      case 'initial_state':
        this.onInitialState(body.data)
        break
      case 'presence_update':
        const presence = parsePresenceState(body.data)
        this.presenceStore.set(presence.userId, presence).then(p => {
          if (p.state === 'online' && this.hooks.userCameOnline) {
            this.userStore.get(p.userId).then(this.hooks.userCameOnline)
          } else if (p.state === 'offline' && this.hooks.userWentOffline) {
            this.userStore.get(p.userId).then(this.hooks.userWentOffline)
          }
        })
        break
    }
  }

  onInitialState = ({ user_states: userStates }) => {
    this.presenceStore.initialize(
      indexBy(prop('userId'), map(parsePresenceState, userStates))
    )
    this.hooks.subscriptionEstablished()
  }
}

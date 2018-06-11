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
import { SUBSCRIPTION_TIMEOUT } from './constants'

export class PresenceSubscription {
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
      this.timeout = setTimeout(() => {
        reject(new Error('presence subscription timed out'))
      }, SUBSCRIPTION_TIMEOUT)
      this.onSubscriptionEstablished = initialState => {
        clearTimeout(this.timeout)
        resolve(initialState)
      }
      this.sub = this.instance.subscribeNonResuming({
        path: `/users/${encodeURIComponent(this.userId)}/presence`,
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
      this.logger.debug('error when cancelling presence subscription', err)
    }
  }

  onEvent = ({ body }) => {
    switch (body.event_name) {
      case 'initial_state':
        this.onInitialState(body.data)
        break
      case 'presence_update':
        this.onPresenceUpdate(body.data)
        break
      case 'join_room_presence_update':
        this.onJoinRoomPresenceUpdate(body.data)
        break
    }
  }

  onInitialState = ({ user_states: userStates }) => {
    this.presenceStore.initialize(
      indexBy(prop('userId'), map(parsePresence, userStates))
    )
    this.onSubscriptionEstablished()
  }

  onPresenceUpdate = data => {
    const presence = parsePresence(data)
    this.presenceStore.set(presence.userId, presence)
      .then(p => this.userStore.get(p.userId)
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

  onJoinRoomPresenceUpdate = ({ user_states: userStates }) => forEach(
    presence => this.presenceStore.set(presence.userId, presence),
    map(parsePresence, userStates)
  )

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

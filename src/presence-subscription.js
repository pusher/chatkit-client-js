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

export class PresenceSubscription {
  constructor (options) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.presenceStore = options.presenceStore
    this.roomSubscriptions = options.roomSubscriptions
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.hooks = { ...this.hooks, subscriptionEstablished: resolve }
      this.sub = this.instance.subscribeNonResuming({
        path: `/users/${encodeURIComponent(this.userId)}/presence`,
        listeners: {
          onError: reject,
          onEvent: this.onEvent
        }
      })
    })
  }

  cancel () {
    this.sub && this.sub.unsubscribe()
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
    this.hooks.subscriptionEstablished()
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

  onCameOnline = user => this.callRelevantHooks('userCameOnline', user)

  onWentOffline = user => this.callRelevantHooks('userWentOffline', user)

  callRelevantHooks = (hookName, user) => {
    if (this.hooks[hookName]) {
      this.hooks[hookName](user)
    }
    compose(
      forEach(([roomId, sub]) => this.roomStore.get(roomId).then(room => {
        if (contains(user.id, room.userIds)) {
          sub.hooks[hookName](user)
        }
      })),
      filter(([roomId, sub]) => sub.hooks[hookName] !== undefined),
      toPairs
    )(this.roomSubscriptions)
  }
}

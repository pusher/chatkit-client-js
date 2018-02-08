import {
  chain,
  compose,
  indexBy,
  join,
  length,
  map,
  pipe,
  prop,
  uniq,
  values
} from 'ramda'

import { appendQueryParam } from './utils'
import { Store } from './store'
import { UserStore } from './user-store'
import { RoomStore } from './room-store'
import { parseUser, parsePresenceState } from './parsers'
import { TypingIndicators } from './typing-indicators'
import { UserSubscription } from './user-subscription'

export class CurrentUser {
  constructor ({ id, apiInstance }) {
    this.id = id
    this.apiInstance = apiInstance
    this.logger = apiInstance.logger
    this.presenceStore = new Store()
    this.userStore = new UserStore({
      apiInstance,
      presenceStore: this.presenceStore,
      logger: this.logger
    })
    this.roomStore = new RoomStore({
      apiInstance: this.apiInstance,
      userStore: this.userStore,
      logger: this.logger
    })
    this.typingIndicators = new TypingIndicators({
      userId: this.id,
      apiInstance: this.apiInstance,
      logger: this.logger
    })
  }

  /* public */

  get rooms () {
    return values(this.roomStore.snapshot())
  }

  get users () {
    return values(this.userStore.snapshot())
  }

  isTypingIn = roomId => this.typingIndicators.sendThrottledRequest(roomId)

  /* internal */

  establishUserSubscription = hooks => {
    this.userSubscription = new UserSubscription({ hooks, ...this })
    return this.userSubscription.connect().then(({ user, basicRooms }) => {
      this.avatarURL = user.avatarURL
      this.createdAt = user.createdAt
      this.customData = user.customData
      this.name = user.name
      this.updatedAt = user.updatedAt
      this.roomStore.initialize(indexBy(prop('id'), basicRooms))
    })
  }

  establishPresenceSubscription = hooks => new Promise((resolve, reject) =>
    this.apiInstance.subscribeNonResuming({
      path: `/users/${this.id}/presence`,
      listeners: {
        onError: reject,
        onEvent: this.onPresenceEvent({
          ...hooks,
          subscriptionEstablished: resolve
        })
      }
    })
  )

  onPresenceEvent = hooks => ({ body }) => {
    switch (body.event_name) {
      case 'initial_state':
        this.onPresenceInitialState(body.data)
        if (hooks.subscriptionEstablished) {
          hooks.subscriptionEstablished()
        }
        break
      case 'presence_update':
        const presence = parsePresenceState(body.data)
        this.presenceStore.set(presence.userId, presence).then(p => {
          if (p.state === 'online' && hooks.userCameOnline) {
            this.userStore.get(p.userId).then(hooks.userCameOnline)
          } else if (p.state === 'offline' && hooks.userWentOffline) {
            this.userStore.get(p.userId).then(hooks.userWentOffline)
          }
        })
        break
    }
  }

  onPresenceInitialState = ({ user_states: userStates }) => compose(
    this.presenceStore.initialize,
    indexBy(prop('userId')),
    map(parsePresenceState)
  )(userStates)

  initializeUserStore = () => {
    const userIds = uniq(chain(prop('userIds'), this.rooms))
    if (length(userIds) === 0) {
      this.userStore.initialize({})
      return
    }
    return this.apiInstance
      .request({
        method: 'GET',
        path: appendQueryParam('user_ids', join(',', userIds), '/users_by_ids')
      })
      .then(pipe(
        JSON.parse,
        map(parseUser),
        indexBy(prop('id')),
        this.userStore.initialize
      ))
      .catch(err => {
        this.logger.warn('error fetching initial user information:', err)
        this.userStore.initialize({})
      })
  }
}

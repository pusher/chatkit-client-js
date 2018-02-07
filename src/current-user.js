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
import { parseUser, parseBasicRoom, parsePresenceState } from './parsers'
import { TypingIndicators } from './typing-indicators'

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

  establishUserSubscription = hooks => new Promise((resolve, reject) =>
    this.apiInstance.subscribeNonResuming({
      path: '/users',
      listeners: {
        onError: reject,
        onEvent: this.onUserEvent({
          ...hooks,
          subscriptionEstablished: resolve
        })
      }
    })
  )

  onUserEvent = hooks => ({ body }) => {
    switch (body.event_name) {
      case 'initial_state':
        this.onUserInitialState(body.data)
        if (hooks.subscriptionEstablished) {
          hooks.subscriptionEstablished()
        }
        break
      case 'added_to_room':
        // TODO fetch new user details in bulk when added to room (etc)
        const basicRoom = parseBasicRoom(body.data.room)
        this.roomStore.set(basicRoom.id, basicRoom).then(room => {
          if (hooks.addedToRoom) {
            hooks.addedToRoom(room)
          }
        })
        break
      case 'removed_from_room':
        this.roomStore.pop(body.data.room_id).then(room => {
          if (hooks.removedFromRoom) {
            hooks.removedFromRoom(room)
          }
        })
        break
      case 'typing_start': // TODO 'is_typing'
        const { room_id: roomId, user_id: userId } = body.data
        Promise.all([this.roomStore.get(roomId), this.userStore.get(userId)])
          .then(([r, u]) => this.typingIndicators.onIsTyping(r, u, hooks))
        break
    }
  }

  onUserInitialState = ({ current_user: currentUser, rooms }) => {
    this.avatarURL = currentUser.avatar_url
    this.createdAt = currentUser.created_at
    this.customData = currentUser.custom_data
    this.id = currentUser.id
    this.name = currentUser.name
    this.updatedAt = currentUser.updated_at
    compose(
      this.roomStore.initialize,
      indexBy(prop('id')),
      map(parseBasicRoom)
    )(rooms)
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

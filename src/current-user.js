import {
  append,
  chain,
  compose,
  join,
  length,
  map,
  pipe,
  prop,
  reduce,
  uniq
} from 'ramda'

import { appendQueryParam } from './utils'
import { Store } from './store'
import { UserStore } from './user-store'
import { parseUser, parseRoom, parsePresenceState } from './parsers'

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
  }

  /* public */

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
        const room = parseRoom(this.userStore, body.data.room)
        this.rooms = append(room, this.rooms)
        if (hooks.addedToRoom) {
          hooks.addedToRoom(room)
        }
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
    this.rooms = map(parseRoom(this.userStore), rooms)
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
    }
  }

  onPresenceInitialState = ({ user_states: userStates }) => {
    compose(
      this.presenceStore.initialize,
      reduce((acc, state) => ({ ...acc, [state.userId]: state }), {}),
      map(parsePresenceState)
    )(userStates)
  }

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
        reduce((acc, user) => ({ ...acc, [user.id]: user }), {}),
        this.userStore.initialize
      ))
      .catch(err => {
        this.logger.warning('error fetching initial user information:', err)
        // fall back to fetching lazily
        this.userStore.initialize({})
      })
  }
}
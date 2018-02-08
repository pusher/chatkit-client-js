import {
  chain,
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
import { parseUser } from './parsers'
import { TypingIndicators } from './typing-indicators'
import { UserSubscription } from './user-subscription'
import { PresenceSubscription } from './presence-subscription'

export class CurrentUser {
  constructor ({ id, apiInstance }) {
    this.id = id
    this.apiInstance = apiInstance
    this.logger = apiInstance.logger
    this.presenceStore = new Store()
    this.userStore = new UserStore({
      instance: this.apiInstance,
      presenceStore: this.presenceStore,
      logger: this.logger
    })
    this.roomStore = new RoomStore({
      instance: this.apiInstance,
      userStore: this.userStore,
      logger: this.logger
    })
    this.typingIndicators = new TypingIndicators({
      userId: this.id,
      instance: this.apiInstance,
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
    this.userSubscription = new UserSubscription({
      hooks,
      userId: this.id,
      instance: this.apiInstance,
      userStore: this.userStore,
      roomStore: this.roomStore,
      typingIndicators: this.typingIndicators
    })
    return this.userSubscription.connect().then(({ user, basicRooms }) => {
      this.avatarURL = user.avatarURL
      this.createdAt = user.createdAt
      this.customData = user.customData
      this.name = user.name
      this.updatedAt = user.updatedAt
      this.roomStore.initialize(indexBy(prop('id'), basicRooms))
    }).then(this.initializeUserStore)
  }

  establishPresenceSubscription = hooks => {
    this.presenceSubscription = new PresenceSubscription({
      hooks,
      userId: this.id,
      instance: this.apiInstance,
      userStore: this.userStore,
      presenceStore: this.presenceStore
    })
    return this.presenceSubscription.connect()
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
        indexBy(prop('id')),
        this.userStore.initialize
      ))
      .catch(err => {
        this.logger.warn('error fetching initial user information:', err)
        this.userStore.initialize({})
      })
  }
}

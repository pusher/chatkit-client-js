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

import { appendQueryParam, typeCheck, typeCheckArr } from './utils'
import { Store } from './store'
import { UserStore } from './user-store'
import { RoomStore } from './room-store'
import { parseUser, parseBasicRoom } from './parsers'
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

  isTypingIn (roomId) {
    typeCheck('roomId', 'number', roomId)
    return this.typingIndicators.sendThrottledRequest(roomId)
  }

  createRoom (options = {}) {
    typeCheck('options', 'object', options)
    if (options.name !== undefined) {
      typeCheck('name', 'string', options.name)
    }
    if (options.addUserIds !== undefined) {
      typeCheckArr('addUserIds', 'string', options.addUserIds)
    }
    return this.apiInstance.request({
      method: 'POST',
      path: '/rooms',
      json: {
        created_by_id: this.id,
        name: options.name,
        private: !!options.private,
        user_ids: options.addUserIds
      }
    })
      .then(res => {
        const basicRoom = parseBasicRoom(JSON.parse(res))
        return this.roomStore.set(basicRoom.id, basicRoom)
      })
      .catch(err => {
        this.logger.warning('error creating room:', err)
        throw err
      })
  }

  getJoinableRooms () {
    // TODO path friendly ids everywhere
    return this.apiInstance
      .request({
        method: 'GET',
        path: `/users/${this.id}/rooms?joinable=true`
      })
      .then(pipe(JSON.parse, map(parseBasicRoom)))
      .catch(err => {
        this.logger.warning('error getting joinable rooms:', err)
        throw err
      })
  }

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

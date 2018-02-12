import {
  chain,
  compose,
  concat,
  indexBy,
  map,
  pipe,
  prop,
  sort,
  uniq,
  values
} from 'ramda'

import {
  checkOneOf,
  typeCheck,
  typeCheckArr,
  typeCheckObj,
  urlEncode
} from './utils'
import { Store } from './store'
import { UserStore } from './user-store'
import { RoomStore } from './room-store'
import { parseBasicRoom, parseBasicMessage } from './parsers'
import { TypingIndicators } from './typing-indicators'
import { UserSubscription } from './user-subscription'
import { PresenceSubscription } from './presence-subscription'
import { RoomSubscription } from './room-subscription'
import { Message } from './message'

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
    this.roomSubscriptions = {}
  }

  /* public */

  get rooms () {
    return values(this.roomStore.snapshot())
  }

  get users () {
    return values(this.userStore.snapshot())
  }

  isTypingIn = (roomId) => {
    typeCheck('roomId', 'number', roomId)
    return this.typingIndicators.sendThrottledRequest(roomId)
  }

  createRoom = ({ name, addUserIds, ...rest } = {}) => {
    name && typeCheck('name', 'string', name)
    addUserIds && typeCheckArr('addUserIds', 'string', addUserIds)
    return this.apiInstance.request({
      method: 'POST',
      path: '/rooms',
      json: {
        created_by_id: this.id,
        name,
        private: !!rest.private, // private is a reserved word in strict mode!
        user_ids: addUserIds
      }
    })
      .then(res => {
        const basicRoom = parseBasicRoom(JSON.parse(res))
        return this.roomStore.set(basicRoom.id, basicRoom)
      })
      .catch(err => {
        this.logger.warn('error creating room:', err)
        throw err
      })
  }

  getJoinableRooms = () => {
    // TODO path friendly ids everywhere
    return this.apiInstance
      .request({
        method: 'GET',
        path: `/users/${this.id}/rooms?joinable=true`
      })
      .then(pipe(JSON.parse, map(parseBasicRoom)))
      .catch(err => {
        this.logger.warn('error getting joinable rooms:', err)
        throw err
      })
  }

  getAllRooms = () => {
    return this.getJoinableRooms().then(concat(this.rooms))
  }

  joinRoom = roomId => {
    typeCheck('roomId', 'number', roomId)
    return this.apiInstance
      .request({
        method: 'POST',
        path: `/users/${this.id}/rooms/${roomId}/join`
      })
      .then(res => {
        const basicRoom = parseBasicRoom(JSON.parse(res))
        return this.roomStore.set(basicRoom.id, basicRoom)
      })
      .catch(err => {
        this.logger.warn(`error joining room ${roomId}:`, err)
        throw err
      })
  }

  leaveRoom = roomId => {
    typeCheck('roomId', 'number', roomId)
    return this.apiInstance
      .request({
        method: 'POST',
        path: `/users/${this.id}/rooms/${roomId}/leave`
      })
      .then(() => this.roomStore.pop(roomId))
      .catch(err => {
        this.logger.warn(`error joining room ${roomId}:`, err)
        throw err
      })
  }

  addUser = (userId, roomId) => {
    typeCheck('userId', 'string', userId)
    typeCheck('roomId', 'number', roomId)
    return this.apiInstance
      .request({
        method: 'PUT',
        path: `/rooms/${roomId}/users/add`,
        json: {
          user_ids: [userId]
        }
      })
      .then(() => this.roomStore.addUserToRoom(roomId, userId))
      .catch(err => {
        this.logger.warn(`error adding user ${userId} to room ${roomId}:`, err)
        throw err
      })
  }

  removeUser = (userId, roomId) => {
    typeCheck('userId', 'string', userId)
    typeCheck('roomId', 'number', roomId)
    return this.apiInstance
      .request({
        method: 'PUT',
        path: `/rooms/${roomId}/users/remove`,
        json: {
          user_ids: [userId]
        }
      })
      .then(() => this.roomStore.removeUserFromRoom(roomId, userId))
      .catch(err => {
        this.logger.warn(
          `error removing user ${userId} from room ${roomId}:`,
          err
        )
        throw err
      })
  }

  // TODO attachments
  sendMessage = ({ text, roomId } = {}) => {
    typeCheck('text', 'string', text)
    typeCheck('roomId', 'number', roomId)
    return this.apiInstance
      .request({
        method: 'POST',
        path: `/rooms/${roomId}/messages`,
        json: { text }
      })
      .then(pipe(JSON.parse, prop('message_id')))
      .catch(err => {
        this.logger.warn(`error sending message to room ${roomId}:`, err)
        throw err
      })
  }

  fetchMessages = (roomId, { initialId, limit, direction } = {}) => {
    typeCheck('roomId', 'number', roomId)
    initialId && typeCheck('initialId', 'number', initialId)
    limit && typeCheck('limit', 'number', limit)
    direction && checkOneOf('direction', ['older', 'newer'], direction)
    return this.apiInstance
      .request({
        method: 'GET',
        path: `/rooms/${roomId}/messages?${urlEncode({
          initial_id: initialId,
          limit,
          direction
        })}`
      })
      .then(res => {
        const messages = map(
          compose(this.decorateMessage, parseBasicMessage),
          JSON.parse(res)
        )
        return this.userStore.fetchMissingUsers(
          uniq(map(prop('senderId'), messages))
        ).then(() => sort((x, y) => x.id - y.id, messages))
      })
      .catch(err => {
        this.logger.warn(`error fetching messages from room ${roomId}:`, err)
        throw err
      })
  }

  subscribeToRoom = (roomId, hooks = {}, messageLimit) => {
    typeCheck('roomId', 'number', roomId)
    typeCheckObj('hooks', 'function', hooks)
    messageLimit && typeCheck('messageLimit', 'number', messageLimit)
    // TODO what is the desired behaviour if there is already a subscription to
    // this room? Close the old one? Throw an error? Merge the hooks?
    this.roomSubscriptions[roomId] = new RoomSubscription({
      roomId,
      hooks,
      messageLimit,
      userId: this.id,
      instance: this.apiInstance,
      userStore: this.userStore,
      roomStore: this.roomStore
    })
    return this.roomSubscriptions[roomId].connect()
  }

  /* internal */

  decorateMessage = basicMessage => new Message(
    basicMessage,
    this.userStore,
    this.roomStore
  )

  establishUserSubscription = hooks => {
    this.userSubscription = new UserSubscription({
      hooks,
      userId: this.id,
      instance: this.apiInstance,
      userStore: this.userStore,
      roomStore: this.roomStore,
      typingIndicators: this.typingIndicators,
      roomSubscriptions: this.roomSubscriptions
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
      roomStore: this.roomStore,
      presenceStore: this.presenceStore,
      roomSubscriptions: this.roomSubscriptions
    })
    return this.presenceSubscription.connect()
  }

  initializeUserStore = () => {
    return this.userStore.fetchMissingUsers(
      uniq(chain(prop('userIds'), this.rooms))
    )
      .catch(err => {
        this.logger.warn('error fetching initial user information:', err)
      })
      .then(() => {
        this.userStore.initialize({})
      })
  }
}

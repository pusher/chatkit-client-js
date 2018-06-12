import { sendRawRequest } from 'pusher-platform'
import {
  chain,
  compose,
  contains,
  has,
  indexBy,
  map,
  forEachObjIndexed,
  max,
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
import {
  parseBasicMessage,
  parseBasicRoom,
  parseFetchedAttachment
} from './parsers'
import { Store } from './store'
import { UserStore } from './user-store'
import { RoomStore } from './room-store'
import { CursorStore } from './cursor-store'
import { TypingIndicators } from './typing-indicators'
import { UserSubscription } from './user-subscription'
import { PresenceSubscription } from './presence-subscription'
import { CursorSubscription } from './cursor-subscription'
import { MessageSubscription } from './message-subscription'
import { RoomSubscription } from './room-subscription'
import { Message } from './message'
import { SET_CURSOR_WAIT } from './constants'

export class CurrentUser {
  constructor ({
    apiInstance,
    cursorsInstance,
    filesInstance,
    hooks,
    id,
    presenceInstance
  }) {
    this.hooks = {
      global: hooks,
      rooms: {}
    }
    this.id = id
    this.encodedId = encodeURIComponent(this.id)
    this.apiInstance = apiInstance
    this.filesInstance = filesInstance
    this.cursorsInstance = cursorsInstance
    this.presenceInstance = presenceInstance
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
    this.cursorStore = new CursorStore({
      instance: this.cursorsInstance,
      userStore: this.userStore,
      roomStore: this.roomStore,
      logger: this.logger
    })
    this.typingIndicators = new TypingIndicators({
      hooks: this.hooks,
      userId: this.id,
      instance: this.apiInstance,
      logger: this.logger
    })
    this.roomSubscriptions = {}
    this.readCursorBuffer = {} // roomId -> { position, [{ resolve, reject }] }
  }

  /* public */

  get rooms () {
    return values(this.roomStore.snapshot())
  }

  get users () {
    return values(this.userStore.snapshot())
  }

  setReadCursor = ({ roomId, position } = {}) => {
    typeCheck('roomId', 'number', roomId)
    typeCheck('position', 'number', position)
    return new Promise((resolve, reject) => {
      if (this.readCursorBuffer[roomId] !== undefined) {
        this.readCursorBuffer[roomId].position =
          max(this.readCursorBuffer[roomId].position, position)
        this.readCursorBuffer[roomId].callbacks.push({ resolve, reject })
      } else {
        this.readCursorBuffer[roomId] = {
          position,
          callbacks: [{ resolve, reject }]
        }
        setTimeout(() => {
          this.setReadCursorRequest({
            roomId,
            ...this.readCursorBuffer[roomId]
          })
          delete this.readCursorBuffer[roomId]
        }, SET_CURSOR_WAIT)
      }
    })
  }

  readCursor = ({ roomId, userId = this.id } = {}) => {
    typeCheck('roomId', 'number', roomId)
    typeCheck('userId', 'string', userId)
    if (userId !== this.id && !has(roomId, this.roomSubscriptions)) {
      const err = new TypeError(
        `Must be subscribed to room ${roomId} to access member's read cursors`
      )
      this.logger.error(err)
      throw err
    }
    return this.cursorStore.getSync(userId, roomId)
  }

  isTypingIn = ({ roomId } = {}) => {
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
    return this.apiInstance
      .request({
        method: 'GET',
        path: `/users/${this.encodedId}/rooms?joinable=true`
      })
      .then(pipe(JSON.parse, map(parseBasicRoom)))
      .catch(err => {
        this.logger.warn('error getting joinable rooms:', err)
        throw err
      })
  }

  joinRoom = ({ roomId } = {}) => {
    typeCheck('roomId', 'number', roomId)
    if (this.isMemberOf(roomId)) {
      return this.roomStore.get(roomId)
    }
    return this.apiInstance
      .request({
        method: 'POST',
        path: `/users/${this.encodedId}/rooms/${roomId}/join`
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

  leaveRoom = ({ roomId } = {}) => {
    typeCheck('roomId', 'number', roomId)
    return this.apiInstance
      .request({
        method: 'POST',
        path: `/users/${this.encodedId}/rooms/${roomId}/leave`
      })
      .then(() => this.roomStore.pop(roomId))
      .catch(err => {
        this.logger.warn(`error leaving room ${roomId}:`, err)
        throw err
      })
  }

  addUserToRoom = ({ userId, roomId } = {}) => {
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

  removeUserFromRoom = ({ userId, roomId } = {}) => {
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

  sendMessage = ({ text, roomId, attachment } = {}) => {
    typeCheck('text', 'string', text)
    typeCheck('roomId', 'number', roomId)
    return new Promise((resolve, reject) => {
      if (attachment !== undefined && isDataAttachment(attachment)) {
        resolve(this.uploadDataAttachment(roomId, attachment))
      } else if (attachment !== undefined && isLinkAttachment(attachment)) {
        resolve({ resource_link: attachment.link, type: attachment.type })
      } else if (attachment !== undefined) {
        reject(new TypeError('attachment was malformed'))
      } else {
        resolve()
      }
    })
      .then(attachment => this.apiInstance.request({
        method: 'POST',
        path: `/rooms/${roomId}/messages`,
        json: { text, attachment }
      }))
      .then(pipe(JSON.parse, prop('message_id')))
      .catch(err => {
        this.logger.warn(`error sending message to room ${roomId}:`, err)
        throw err
      })
  }

  fetchMessages = ({ roomId, initialId, limit, direction } = {}) => {
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

  subscribeToRoom = ({ roomId, hooks = {}, messageLimit } = {}) => {
    typeCheck('roomId', 'number', roomId)
    typeCheckObj('hooks', 'function', hooks)
    messageLimit && typeCheck('messageLimit', 'number', messageLimit)
    if (this.roomSubscriptions[roomId]) {
      this.roomSubscriptions[roomId].cancel()
    }
    this.hooks.rooms[roomId] = hooks
    this.roomSubscriptions[roomId] = new RoomSubscription({
      messageSub: new MessageSubscription({
        roomId,
        hooks: this.hooks,
        messageLimit,
        userId: this.id,
        instance: this.apiInstance,
        userStore: this.userStore,
        roomStore: this.roomStore,
        logger: this.logger
      }),
      cursorSub: new CursorSubscription({
        onNewCursorHook: cursor => {
          if (
            this.hooks.rooms[roomId] &&
            this.hooks.rooms[roomId].onNewReadCursor && cursor.type === 0 &&
            cursor.userId !== this.id
          ) {
            this.hooks.rooms[roomId].onNewReadCursor(cursor)
          }
        },
        path: `/cursors/0/rooms/${roomId}`,
        cursorStore: this.cursorStore,
        instance: this.cursorsInstance,
        logger: this.logger
      })
    })
    return this.joinRoom({ roomId })
      .then(room => Promise.all([
        this.roomSubscriptions[roomId].messageSub.connect(),
        this.roomSubscriptions[roomId].cursorSub.connect()
      ]).then(() => room))
      .catch(err => {
        this.logger.warn(`error subscribing to room ${roomId}:`, err)
        throw err
      })
  }

  fetchAttachment = ({ url } = {}) => {
    return this.filesInstance.tokenProvider.fetchToken()
      .then(token => sendRawRequest({
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        url
      }))
      .then(pipe(JSON.parse, parseFetchedAttachment))
      .catch(err => {
        this.logger.warn(`error fetching attachment:`, err)
        throw err
      })
  }

  updateRoom = ({ roomId, name, ...rest } = {}) => {
    typeCheck('roomId', 'number', roomId)
    name && typeCheck('name', 'string', name)
    rest.private && typeCheck('private', 'boolean', rest.private)
    return this.apiInstance.request({
      method: 'PUT',
      path: `/rooms/${roomId}`,
      json: {
        name,
        private: rest.private // private is a reserved word in strict mode!
      }
    })
      .then(() => {})
      .catch(err => {
        this.logger.warn('error updating room:', err)
        throw err
      })
  }

  deleteRoom = ({ roomId } = {}) => {
    typeCheck('roomId', 'number', roomId)
    return this.apiInstance.request({
      method: 'DELETE',
      path: `/rooms/${roomId}`
    })
      .then(() => {})
      .catch(err => {
        this.logger.warn('error deleting room:', err)
        throw err
      })
  }

  /* internal */

  setReadCursorRequest = ({ roomId, position, callbacks }) => {
    return this.cursorsInstance
      .request({
        method: 'PUT',
        path: `/cursors/0/rooms/${roomId}/users/${this.encodedId}`,
        json: { position }
      })
      .then(() => map(x => x.resolve(), callbacks))
      .catch(err => {
        this.logger.warn('error setting cursor:', err)
        map(x => x.reject(err), callbacks)
      })
  }

  uploadDataAttachment = (roomId, { file, name }) => {
    // TODO some validation on allowed file names?
    // TODO polyfill FormData?
    const body = new FormData() // eslint-disable-line no-undef
    body.append('file', file, name)
    return this.filesInstance.request({
      method: 'POST',
      path: `/rooms/${roomId}/users/${this.encodedId}/files/${name}`,
      body
    })
      .then(JSON.parse)
  }

  isMemberOf = roomId => contains(roomId, map(prop('id'), this.rooms))

  decorateMessage = basicMessage => new Message(
    basicMessage,
    this.userStore,
    this.roomStore
  )

  establishUserSubscription = () => {
    this.userSubscription = new UserSubscription({
      hooks: this.hooks,
      userId: this.id,
      instance: this.apiInstance,
      userStore: this.userStore,
      roomStore: this.roomStore,
      typingIndicators: this.typingIndicators,
      logger: this.logger
    })
    return this.userSubscription.connect()
      .then(({ user, basicRooms }) => {
        this.avatarURL = user.avatarURL
        this.createdAt = user.createdAt
        this.customData = user.customData
        this.name = user.name
        this.updatedAt = user.updatedAt
        this.roomStore.initialize(indexBy(prop('id'), basicRooms))
      })
      .then(this.initializeUserStore)
      .catch(err => {
        this.logger.error('error establishing user subscription:', err)
        throw err
      })
  }

  establishPresenceSubscription = () => {
    this.presenceSubscription = new PresenceSubscription({
      hooks: this.hooks,
      userId: this.id,
      instance: this.presenceInstance,
      userStore: this.userStore,
      roomStore: this.roomStore,
      presenceStore: this.presenceStore,
      logger: this.logger
    })
    return this.presenceSubscription.connect()
      .catch(err => {
        this.logger.error('error establishing presence subscription:', err)
        throw err
      })
  }

  establishCursorSubscription = () => {
    this.cursorSubscription = new CursorSubscription({
      onNewCursorHook: cursor => {
        if (
          this.hooks.global.onNewReadCursor && cursor.type === 0 &&
          this.isMemberOf(cursor.roomId)
        ) {
          this.hooks.global.onNewReadCursor(cursor)
        }
      },
      path: `/cursors/0/users/${this.encodedId}`,
      cursorStore: this.cursorStore,
      instance: this.cursorsInstance,
      logger: this.logger
    })
    return this.cursorSubscription.connect()
      .then(() => this.cursorStore.initialize({}))
      .catch(err => {
        this.logger.error('error establishing cursor subscription:', err)
        throw err
      })
  }

  initializeUserStore = () => {
    return this.userStore.fetchMissingUsers(
      uniq(chain(prop('userIds'), this.rooms))
    )
      .catch(err => {
        this.logger.warn('error fetching initial user information:', err)
      })
      .then(() => this.userStore.initialize({}))
  }

  disconnect = () => {
    this.userSubscription.cancel()
    this.presenceSubscription.cancel()
    this.cursorSubscription.cancel()
    forEachObjIndexed(sub => sub.cancel(), this.roomSubscriptions)
  }
}

const isDataAttachment = ({ file, name }) => {
  if (file === undefined || name === undefined) {
    return false
  }
  typeCheck('attachment.file', 'object', file)
  typeCheck('attachment.name', 'string', name)
  return true
}

const isLinkAttachment = ({ link, type }) => {
  if (link === undefined || type === undefined) {
    return false
  }
  typeCheck('attachment.link', 'string', link)
  typeCheck('attachment.type', 'string', type)
  return true
}

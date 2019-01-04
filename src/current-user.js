import {
  compose,
  contains,
  has,
  map,
  forEachObjIndexed,
  max,
  pipe,
  prop,
  sort,
  uniq,
  values,
} from "ramda"

import {
  checkOneOf,
  typeCheck,
  typeCheckArr,
  typeCheckObj,
  urlEncode,
} from "./utils"
import { parseBasicMessage, parseBasicRoom } from "./parsers"
import { UserStore } from "./user-store"
import { RoomStore } from "./room-store"
import { CursorStore } from "./cursor-store"
import { TypingIndicators } from "./typing-indicators"
import { UserSubscription } from "./user-subscription"
import { PresenceSubscription } from "./presence-subscription"
import { UserPresenceSubscription } from "./user-presence-subscription"
import { CursorSubscription } from "./cursor-subscription"
import { MessageSubscription } from "./message-subscription"
import { MembershipSubscription } from "./membership-subscription"
import { RoomSubscription } from "./room-subscription"
import { Message } from "./message"
import { SET_CURSOR_WAIT } from "./constants"

export class CurrentUser {
  constructor({
    apiInstance,
    connectionTimeout,
    cursorsInstance,
    filesInstance,
    hooks,
    id,
    presenceInstance,
  }) {
    this.hooks = {
      global: hooks,
      rooms: {},
    }
    this.id = id
    this.encodedId = encodeURIComponent(this.id)
    this.apiInstance = apiInstance
    this.filesInstance = filesInstance
    this.cursorsInstance = cursorsInstance
    this.connectionTimeout = connectionTimeout
    this.presenceInstance = presenceInstance
    this.logger = apiInstance.logger
    this.presenceStore = {}
    this.userStore = new UserStore({
      instance: this.apiInstance,
      presenceStore: this.presenceStore,
      logger: this.logger,
    })
    this.roomStore = new RoomStore({
      instance: this.apiInstance,
      userStore: this.userStore,
      isSubscribedTo: userId => this.isSubscribedTo(userId),
      logger: this.logger,
    })
    this.cursorStore = new CursorStore({
      instance: this.cursorsInstance,
      userStore: this.userStore,
      roomStore: this.roomStore,
      logger: this.logger,
    })
    this.typingIndicators = new TypingIndicators({
      hooks: this.hooks,
      instance: this.apiInstance,
      logger: this.logger,
    })
    this.userStore.onSetHooks.push(userId =>
      this.subscribeToUserPresence(userId),
    )
    this.roomSubscriptions = {}
    this.readCursorBuffer = {} // roomId -> { position, [{ resolve, reject }] }
    this.userPresenceSubscriptions = {}

    this.setReadCursor = this.setReadCursor.bind(this)
    this.readCursor = this.readCursor.bind(this)
    this.isTypingIn = this.isTypingIn.bind(this)
    this.createRoom = this.createRoom.bind(this)
    this.getJoinableRooms = this.getJoinableRooms.bind(this)
    this.joinRoom = this.joinRoom.bind(this)
    this.leaveRoom = this.leaveRoom.bind(this)
    this.addUserToRoom = this.addUserToRoom.bind(this)
    this.removeUserFromRoom = this.removeUserFromRoom.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.fetchMessages = this.fetchMessages.bind(this)
    this.subscribeToRoom = this.subscribeToRoom.bind(this)
    this.updateRoom = this.updateRoom.bind(this)
    this.deleteRoom = this.deleteRoom.bind(this)
    this.setReadCursorRequest = this.setReadCursorRequest.bind(this)
    this.uploadDataAttachment = this.uploadDataAttachment.bind(this)
    this.isMemberOf = this.isMemberOf.bind(this)
    this.isSubscribedTo = this.isSubscribedTo.bind(this)
    this.decorateMessage = this.decorateMessage.bind(this)
    this.establishUserSubscription = this.establishUserSubscription.bind(this)
    this.establishCursorSubscription = this.establishCursorSubscription.bind(
      this,
    )
    this.establishPresenceSubscription = this.establishPresenceSubscription.bind(
      this,
    )
    this.subscribeToUserPresence = this.subscribeToUserPresence.bind(this)
    this.disconnect = this.disconnect.bind(this)
  }

  /* public */

  get rooms() {
    return values(this.roomStore.snapshot())
  }

  get users() {
    return values(this.userStore.snapshot())
  }

  setReadCursor({ roomId, position } = {}) {
    typeCheck("roomId", "string", roomId)
    typeCheck("position", "number", position)
    return new Promise((resolve, reject) => {
      if (this.readCursorBuffer[roomId] !== undefined) {
        this.readCursorBuffer[roomId].position = max(
          this.readCursorBuffer[roomId].position,
          position,
        )
        this.readCursorBuffer[roomId].callbacks.push({ resolve, reject })
      } else {
        this.readCursorBuffer[roomId] = {
          position,
          callbacks: [{ resolve, reject }],
        }
        setTimeout(() => {
          this.setReadCursorRequest({
            roomId,
            ...this.readCursorBuffer[roomId],
          })
          delete this.readCursorBuffer[roomId]
        }, SET_CURSOR_WAIT)
      }
    })
  }

  readCursor({ roomId, userId = this.id } = {}) {
    typeCheck("roomId", "string", roomId)
    typeCheck("userId", "string", userId)
    if (userId !== this.id && !this.isSubscribedTo(roomId)) {
      const err = new Error(
        `Must be subscribed to room ${roomId} to access member's read cursors`,
      )
      this.logger.error(err)
      throw err
    }
    return this.cursorStore.getSync(userId, roomId)
  }

  isTypingIn({ roomId } = {}) {
    typeCheck("roomId", "string", roomId)
    return this.typingIndicators.sendThrottledRequest(roomId)
  }

  createRoom({ name, addUserIds, customData, ...rest } = {}) {
    name && typeCheck("name", "string", name)
    addUserIds && typeCheckArr("addUserIds", "string", addUserIds)
    customData && typeCheck("customData", "object", customData)
    return this.apiInstance
      .request({
        method: "POST",
        path: "/rooms",
        json: {
          created_by_id: this.id,
          name,
          private: !!rest.private, // private is a reserved word in strict mode!
          user_ids: addUserIds,
          custom_data: customData,
        },
      })
      .then(res => this.roomStore.set(parseBasicRoom(JSON.parse(res))))
      .catch(err => {
        this.logger.warn("error creating room:", err)
        throw err
      })
  }

  getJoinableRooms() {
    return this.apiInstance
      .request({
        method: "GET",
        path: `/users/${this.encodedId}/rooms?joinable=true`,
      })
      .then(
        pipe(
          JSON.parse,
          map(parseBasicRoom),
        ),
      )
      .catch(err => {
        this.logger.warn("error getting joinable rooms:", err)
        throw err
      })
  }

  joinRoom({ roomId } = {}) {
    typeCheck("roomId", "string", roomId)
    if (this.isMemberOf(roomId)) {
      return this.roomStore.get(roomId)
    }
    return this.apiInstance
      .request({
        method: "POST",
        path: `/users/${this.encodedId}/rooms/${encodeURIComponent(
          roomId,
        )}/join`,
      })
      .then(res => this.roomStore.set(parseBasicRoom(JSON.parse(res))))
      .catch(err => {
        this.logger.warn(`error joining room ${roomId}:`, err)
        throw err
      })
  }

  leaveRoom({ roomId } = {}) {
    typeCheck("roomId", "string", roomId)
    return this.apiInstance
      .request({
        method: "POST",
        path: `/users/${this.encodedId}/rooms/${encodeURIComponent(
          roomId,
        )}/leave`,
      })
      .then(() => this.roomStore.pop(roomId))
      .catch(err => {
        this.logger.warn(`error leaving room ${roomId}:`, err)
        throw err
      })
  }

  addUserToRoom({ userId, roomId } = {}) {
    typeCheck("userId", "string", userId)
    typeCheck("roomId", "string", roomId)
    return this.apiInstance
      .request({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(roomId)}/users/add`,
        json: {
          user_ids: [userId],
        },
      })
      .then(() => this.roomStore.addUserToRoom(roomId, userId))
      .catch(err => {
        this.logger.warn(`error adding user ${userId} to room ${roomId}:`, err)
        throw err
      })
  }

  removeUserFromRoom({ userId, roomId } = {}) {
    typeCheck("userId", "string", userId)
    typeCheck("roomId", "string", roomId)
    return this.apiInstance
      .request({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(roomId)}/users/remove`,
        json: {
          user_ids: [userId],
        },
      })
      .then(() => this.roomStore.removeUserFromRoom(roomId, userId))
      .catch(err => {
        this.logger.warn(
          `error removing user ${userId} from room ${roomId}:`,
          err,
        )
        throw err
      })
  }

  sendMessage({ text, roomId, attachment } = {}) {
    typeCheck("text", "string", text)
    typeCheck("roomId", "string", roomId)
    return new Promise((resolve, reject) => {
      if (attachment !== undefined && isDataAttachment(attachment)) {
        resolve(this.uploadDataAttachment(roomId, attachment))
      } else if (attachment !== undefined && isLinkAttachment(attachment)) {
        resolve({ resource_link: attachment.link, type: attachment.type })
      } else if (attachment !== undefined) {
        reject(new TypeError("attachment was malformed"))
      } else {
        resolve()
      }
    })
      .then(attachment =>
        this.apiInstance.request({
          method: "POST",
          path: `/rooms/${encodeURIComponent(roomId)}/messages`,
          json: { text, attachment },
        }),
      )
      .then(
        pipe(
          JSON.parse,
          prop("message_id"),
        ),
      )
      .catch(err => {
        this.logger.warn(`error sending message to room ${roomId}:`, err)
        throw err
      })
  }

  fetchMessages({ roomId, initialId, limit, direction } = {}) {
    typeCheck("roomId", "string", roomId)
    initialId && typeCheck("initialId", "number", initialId)
    limit && typeCheck("limit", "number", limit)
    direction && checkOneOf("direction", ["older", "newer"], direction)
    return this.apiInstance
      .request({
        method: "GET",
        path: `/rooms/${encodeURIComponent(roomId)}/messages?${urlEncode({
          initial_id: initialId,
          limit,
          direction,
        })}`,
      })
      .then(res => {
        const messages = map(
          compose(
            this.decorateMessage,
            parseBasicMessage,
          ),
          JSON.parse(res),
        )
        return this.userStore
          .fetchMissingUsers(uniq(map(prop("senderId"), messages)))
          .then(() => sort((x, y) => x.id - y.id, messages))
      })
      .catch(err => {
        this.logger.warn(`error fetching messages from room ${roomId}:`, err)
        throw err
      })
  }

  subscribeToRoom({ roomId, hooks = {}, messageLimit } = {}) {
    typeCheck("roomId", "string", roomId)
    typeCheckObj("hooks", "function", hooks)
    messageLimit && typeCheck("messageLimit", "number", messageLimit)
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
        typingIndicators: this.typingIndicators,
        logger: this.logger,
        connectionTimeout: this.connectionTimeout,
      }),
      cursorSub: new CursorSubscription({
        onNewCursorHook: cursor => {
          if (
            this.hooks.rooms[roomId] &&
            this.hooks.rooms[roomId].onNewReadCursor &&
            cursor.type === 0 &&
            cursor.userId !== this.id
          ) {
            this.hooks.rooms[roomId].onNewReadCursor(cursor)
          }
        },
        path: `/cursors/0/rooms/${encodeURIComponent(roomId)}`,
        cursorStore: this.cursorStore,
        instance: this.cursorsInstance,
        logger: this.logger,
        connectionTimeout: this.connectionTimeout,
      }),
      membershipSub: new MembershipSubscription({
        roomId,
        hooks: this.hooks,
        instance: this.apiInstance,
        userStore: this.userStore,
        roomStore: this.roomStore,
        logger: this.logger,
        connectionTimeout: this.connectionTimeout,
      }),
    })
    return this.joinRoom({ roomId })
      .then(room => this.roomSubscriptions[roomId].connect().then(() => room))
      .catch(err => {
        this.logger.warn(`error subscribing to room ${roomId}:`, err)
        throw err
      })
  }

  updateRoom({ roomId, name, customData, ...rest } = {}) {
    typeCheck("roomId", "string", roomId)
    name && typeCheck("name", "string", name)
    rest.private && typeCheck("private", "boolean", rest.private)
    customData && typeCheck("customData", "object", customData)
    return this.apiInstance
      .request({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(roomId)}`,
        json: {
          name,
          private: rest.private, // private is a reserved word in strict mode!
          custom_data: customData,
        },
      })
      .then(() => {})
      .catch(err => {
        this.logger.warn("error updating room:", err)
        throw err
      })
  }

  deleteRoom({ roomId } = {}) {
    typeCheck("roomId", "string", roomId)
    return this.apiInstance
      .request({
        method: "DELETE",
        path: `/rooms/${encodeURIComponent(roomId)}`,
      })
      .then(() => {})
      .catch(err => {
        this.logger.warn("error deleting room:", err)
        throw err
      })
  }

  /* internal */

  setReadCursorRequest({ roomId, position, callbacks }) {
    return this.cursorsInstance
      .request({
        method: "PUT",
        path: `/cursors/0/rooms/${encodeURIComponent(roomId)}/users/${
          this.encodedId
        }`,
        json: { position },
      })
      .then(() => map(x => x.resolve(), callbacks))
      .catch(err => {
        this.logger.warn("error setting cursor:", err)
        map(x => x.reject(err), callbacks)
      })
  }

  uploadDataAttachment(roomId, { file, name }) {
    // TODO polyfill FormData?
    const body = new FormData() // eslint-disable-line no-undef
    body.append("file", file, name)
    return this.filesInstance
      .request({
        method: "POST",
        path: `/rooms/${encodeURIComponent(roomId)}/users/${
          this.encodedId
        }/files/${encodeURIComponent(name)}`,
        body,
      })
      .then(JSON.parse)
  }

  isMemberOf(roomId) {
    return contains(roomId, map(prop("id"), this.rooms))
  }

  isSubscribedTo(roomId) {
    return has(roomId, this.roomSubscriptions)
  }

  decorateMessage(basicMessage) {
    return new Message(basicMessage, this.userStore, this.roomStore)
  }

  establishUserSubscription() {
    this.userSubscription = new UserSubscription({
      hooks: this.hooks,
      userId: this.id,
      instance: this.apiInstance,
      userStore: this.userStore,
      roomStore: this.roomStore,
      typingIndicators: this.typingIndicators,
      logger: this.logger,
      connectionTimeout: this.connectionTimeout,
    })
    return this.userSubscription
      .connect()
      .then(({ user, basicRooms }) => {
        this.avatarURL = user.avatarURL
        this.createdAt = user.createdAt
        this.customData = user.customData
        this.name = user.name
        this.updatedAt = user.updatedAt
        return Promise.all(
          basicRooms.map(basicRoom => this.roomStore.set(basicRoom)),
        )
      })
      .catch(err => {
        this.logger.error("error establishing user subscription:", err)
        throw err
      })
  }

  establishCursorSubscription() {
    this.cursorSubscription = new CursorSubscription({
      onNewCursorHook: cursor => {
        if (
          this.hooks.global.onNewReadCursor &&
          cursor.type === 0 &&
          this.isMemberOf(cursor.roomId)
        ) {
          this.hooks.global.onNewReadCursor(cursor)
        }
      },
      path: `/cursors/0/users/${this.encodedId}`,
      cursorStore: this.cursorStore,
      instance: this.cursorsInstance,
      logger: this.logger,
      connectionTimeout: this.connectionTimeout,
    })
    return this.cursorSubscription.connect().catch(err => {
      this.logger.error("error establishing cursor subscription:", err)
      throw err
    })
  }

  establishPresenceSubscription() {
    this.presenceSubscription = new PresenceSubscription({
      userId: this.id,
      instance: this.presenceInstance,
      logger: this.logger,
      connectionTimeout: this.connectionTimeout,
    })

    return Promise.all([
      this.userStore.fetchBasicUsers([this.id]),
      this.subscribeToUserPresence(this.id),
      this.presenceSubscription.connect().catch(err => {
        this.logger.warn("error establishing presence subscription:", err)
        throw err
      }),
    ])
  }

  subscribeToUserPresence(userId) {
    if (this.userPresenceSubscriptions[userId]) {
      return Promise.resolve()
    }

    const userPresenceSub = new UserPresenceSubscription({
      hooks: this.hooks,
      userId: userId,
      instance: this.presenceInstance,
      userStore: this.userStore,
      roomStore: this.roomStore,
      presenceStore: this.presenceStore,
      logger: this.logger,
      connectionTimeout: this.connectionTimeout,
    })

    this.userPresenceSubscriptions[userId] = userPresenceSub
    return userPresenceSub.connect()
  }

  disconnect() {
    this.userSubscription.cancel()
    this.presenceSubscription.cancel()
    this.cursorSubscription.cancel()
    forEachObjIndexed(sub => sub.cancel(), this.roomSubscriptions)
    forEachObjIndexed(sub => sub.cancel(), this.userPresenceSubscriptions)
  }
}

const isDataAttachment = ({ file, name }) => {
  if (file === undefined || name === undefined) {
    return false
  }
  typeCheck("attachment.file", "object", file)
  typeCheck("attachment.name", "string", name)
  return true
}

const isLinkAttachment = ({ link, type }) => {
  if (link === undefined || type === undefined) {
    return false
  }
  typeCheck("attachment.link", "string", link)
  typeCheck("attachment.type", "string", type)
  return true
}

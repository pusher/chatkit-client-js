import {
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

import { sendRawRequest, Instance, Logger } from "@pusher/platform"

import { urlEncode } from "./utils"
import { parseBasicMessage, parseBasicRoom } from "./parsers"
import { UserStore } from "./user-store"
import { RoomStore } from "./room-store"
import { CursorStore } from "./cursor-store"
import { TypingIndicators } from "./typing-indicators"
import { UserSubscription } from "./user-subscription"
import { PresenceSubscription } from "./presence-subscription"
import { UserPresenceSubscription } from "./user-presence-subscription"
import { RoomSubscription } from "./room-subscription"
import { Message, BasicMessage, MessagePart } from "./message"
import { SET_CURSOR_WAIT } from "./constants"
import { Room } from "./room";
import { User, PresenceStore, BasicUser, Presence } from "./user";
import { Cursor } from "./cursor";

type Callbacks = { resolve: (data?: any) => void, reject: (error?: any) => void };
type MessageFetchDirection = 'older' | 'newer'

export class CurrentUser {
  public id: string;
  public encodedId: string;
  public connectionTimeout: number;

  public avatarURL?: string;
  public createdAt?: string;
  public customData?: any;
  public name?: string;
  public updatedAt?: string;

  public serverInstanceV2: Instance;
  public serverInstanceV4: Instance;
  public filesInstance: Instance;
  public cursorsInstance: Instance;
  public presenceInstance: Instance;
  public logger: Logger;
  public presenceStore: PresenceStore;
  public userStore: UserStore;
  public roomStore: RoomStore;
  public cursorStore: CursorStore;
  public typingIndicators: TypingIndicators;
  public roomSubscriptions: { [roomId: string]: RoomSubscription };
  public readCursorBuffer: { [roomId: string]: { position: number, callbacks: Callbacks[] } };
  public userPresenceSubscriptions: { [userId: string]: UserPresenceSubscription }
  public userSubscription?: UserSubscription;
  public presenceSubscription?: PresenceSubscription;

  public hooks: {
    global: {
      onAddedToRoom?: (room: Room) => void;
      onRemovedFromRoom?: (room: Room) => void;
      onRoomUpdated?: (room: Room) => void;
      onRoomDeleted?: (room: Room) => void;
      onUserStartedTyping?: (room: Room, user: User) => void;
      onUserStoppedTyping?: (room: Room, user: User) => void;
      onUserJoinedRoom?: (room: Room, user: User) => void;
      onUserLeftRoom?: (room: Room, user: User) => void;
      onPresenceChanged?: (state: { current: Presence, previous: Presence }, user: User) => void;
    },
    rooms: {
      onMessage?: (data: Message) => any,
      onNewReadCursor?: (cursor: Cursor) => void;
      onUserJoined?: (user: User) => void;
      onUserLeft?: (user: User) => void;
    }
  }

  constructor({
    serverInstanceV2,
    serverInstanceV4,
    connectionTimeout,
    cursorsInstance,
    filesInstance,
    hooks,
    id,
    presenceInstance,
  }: {
    serverInstanceV2: Instance;
    serverInstanceV4: Instance;
    connectionTimeout: number;
    cursorsInstance: Instance;
    filesInstance: Instance;
    hooks: CurrentUser['hooks']['global'];
    id: string;
    presenceInstance: Instance;
  }) {
    this.hooks = {
      global: hooks,
      rooms: {},
    }
    this.id = id
    this.encodedId = encodeURIComponent(this.id)
    this.serverInstanceV2 = serverInstanceV2
    this.serverInstanceV4 = serverInstanceV4
    this.filesInstance = filesInstance
    this.cursorsInstance = cursorsInstance
    this.connectionTimeout = connectionTimeout
    this.presenceInstance = presenceInstance
    this.logger = serverInstanceV4.logger
    this.presenceStore = {}
    this.userStore = new UserStore({
      instance: this.serverInstanceV4,
      presenceStore: this.presenceStore,
      logger: this.logger,
    })
    this.roomStore = new RoomStore({
      instance: this.serverInstanceV4,
      userStore: this.userStore,
      isSubscribedTo: (userId: string) => this.isSubscribedTo(userId),
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
      instance: this.serverInstanceV4,
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
    this.sendSimpleMessage = this.sendSimpleMessage.bind(this)
    this.sendMultipartMessage = this.sendMultipartMessage.bind(this)
    this.fetchMessages = this.fetchMessages.bind(this)
    this.fetchMultipartMessages = this.fetchMultipartMessages.bind(this)
    this.subscribeToRoom = this.subscribeToRoom.bind(this)
    this.subscribeToRoomMultipart = this.subscribeToRoomMultipart.bind(this)
    this.updateRoom = this.updateRoom.bind(this)
    this.deleteRoom = this.deleteRoom.bind(this)
    this.setReadCursorRequest = this.setReadCursorRequest.bind(this)
    this.uploadDataAttachment = this.uploadDataAttachment.bind(this)
    this.isMemberOf = this.isMemberOf.bind(this)
    this.isSubscribedTo = this.isSubscribedTo.bind(this)
    this.decorateMessage = this.decorateMessage.bind(this)
    this.setPropertiesFromBasicUser = this.setPropertiesFromBasicUser.bind(this)
    this.establishUserSubscription = this.establishUserSubscription.bind(this)
    this.establishPresenceSubscription = this.establishPresenceSubscription.bind(
      this,
    )
    this.subscribeToUserPresence = this.subscribeToUserPresence.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this._uploadAttachment = this._uploadAttachment.bind(this)
  }

  public get rooms() {
    return values(this.roomStore.snapshot())
  }

  public get users() {
    return values(this.userStore.snapshot())
  }

  public setReadCursor({roomId, position}: {roomId: string, position: number}) {
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

  public readCursor({roomId, userId = this.id} : {roomId: string, userId: string }) {
    if (userId !== this.id && !this.isSubscribedTo(roomId)) {
      const err = new Error(
        `Must be subscribed to room ${roomId} to access member's read cursors`,
      )
      this.logger.error(err)
      throw err
    }
    return this.cursorStore.getSync(userId, roomId)
  }

  public isTypingIn({roomId}: {roomId: string}) {
    return this.typingIndicators.sendThrottledRequest(roomId)
  }

  public createRoom({name, addUserIds, customData, isPrivate}: { name: string, addUserIds: string[], customData?: any, isPrivate?: boolean }) {
    return this.serverInstanceV4
      .request({
        method: "POST",
        path: "/rooms",
        json: {
          created_by_id: this.id,
          name: name,
          private: !!isPrivate, // private is a reserved word in strict mode!
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

  public getJoinableRooms() {
    return this.serverInstanceV4
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

  public joinRoom({roomId}: {roomId: string}) {
    if (this.isMemberOf(roomId)) {
      return this.roomStore.get(roomId)
    }
    return this.serverInstanceV4
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

  public leaveRoom({roomId}: {roomId: string}) {
    return this.roomStore
      .get(roomId)
      .then(room =>
        this.serverInstanceV4
          .request({
            method: "POST",
            path: `/users/${this.encodedId}/rooms/${encodeURIComponent(
              roomId,
            )}/leave`,
          })
          .then(() => room),
      )
      .catch(err => {
        this.logger.warn(`error leaving room ${roomId}:`, err)
        throw err
      })
  }

  public addUserToRoom({userId, roomId}: {userId: string, roomId: string}) {
    return this.serverInstanceV4
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

  public removeUserFromRoom({userId, roomId}: {userId: string, roomId: string}) {
    return this.serverInstanceV4
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

  public sendMessage({text, roomId, attachment}: { text: string, roomId: string, 
    attachment?: { 
      file?: File, 
      link?: string, 
      type?: 'image' | 'video' | 'audio' | 'file' ,
      name?: string
  }}) {
    return new Promise((resolve, reject) => {
      if (attachment && isDataAttachment(attachment)) {
        resolve(this.uploadDataAttachment(roomId, {
          file: attachment.file!,
          name: attachment.name!
        }))
      } else if (attachment && isLinkAttachment(attachment)) {
        resolve({ resource_link: attachment.link, type: attachment.type })
      } else if (attachment) {
        reject(new TypeError("attachment was malformed"))
      } else {
        resolve()
      }
    })
      .then(attachment =>
        this.serverInstanceV2.request({
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

  public sendSimpleMessage({roomId, text}: {roomId: string, text: string}) {
    return this.sendMultipartMessage({
      roomId,
      parts: [{ type: "text/plain", content: text }],
    })
  }

  public sendMultipartMessage({roomId, parts}: {roomId: string, parts: {
    type: string;
    content?: string;
    url?: string;
    customData?: any;
    file?: File;
    name?: string;
  }[]}) {
    if (parts.length === 0) {
      return Promise.reject(
        new TypeError("message must contain at least one part"),
      )
    }
    return Promise.all(
      parts.map(part => {
        part.type = part.type || (part.file && part.file.type) || ''
        return part.file ? this._uploadAttachment(roomId, {
          type: part.type!,
          name: part.name,
          customData: part.customData,
          file: part.file!
        }) : new Promise(resolve => resolve(part))
      }),
    )
      .then(parts =>
        this.serverInstanceV4.request({
          method: "POST",
          path: `/rooms/${encodeURIComponent(roomId)}/messages`,
          json: {
            parts: parts.map(part => ({
              type: part.type,
              content,
              url,
              attachment,
            })),
          },
        }),
      )
      .then(res => JSON.parse(res).message_id)
      .catch(err => {
        this.logger.warn(`error sending message to room ${roomId}:`, err)
        throw err
      })
  }

  public fetchMessages({roomId, initialId, limit, direction, serverInstance}: { 
    roomId: string, 
    initialId?: number, 
    limit?: number,
    direction?: MessageFetchDirection,
    serverInstance?: Instance
  }) {
    return (serverInstance || this.serverInstanceV2)
      .request({
        method: "GET",
        path: `/rooms/${encodeURIComponent(roomId)}/messages?${urlEncode({
          initial_id: initialId,
          limit: limit,
          direction: direction,
        })}`,
      })
      .then(res => {
        const messages = JSON.parse(res).map((m: any) =>
          this.decorateMessage(parseBasicMessage(m)),
        )
        return this.userStore
          .fetchMissingUsers(uniq(map(prop("senderId"), messages)))
          .then(() => sort((x: any, y: any) => x.id - y.id, messages))
      })
      .catch(err => {
        this.logger.warn(`error fetching messages from room ${roomId}:`, err)
        throw err
      })
  }

  public fetchMultipartMessages(options: {
    roomId: string,
    initialId?: number,
    limit?: number,
    direction?: MessageFetchDirection
  }) {
    return this.fetchMessages({...options, serverInstance: this.serverInstanceV4})
  }

  public subscribeToRoom({roomId, hooks = {}, messageLimit, serverInstance}: {
    roomId: string,
    hooks?: {
      onMessage?: (data: Message) => any,
      onNewReadCursor?: (cursor: Cursor) => void;
      onUserJoined?: (user: User) => void;
      onUserLeft?: (user: User) => void;
    },
    messageLimit?: number,
    serverInstance?: Instance
  }) {
    if (this.roomSubscriptions[roomId]) {
      this.roomSubscriptions[roomId].cancel()
    }
    this.hooks.rooms[roomId] = hooks || {}
    const roomSubscription = new RoomSubscription({
      serverInstance: serverInstance || this.serverInstanceV2,
      connectionTimeout: this.connectionTimeout,
      cursorStore: this.cursorStore,
      cursorsInstance: this.cursorsInstance,
      hooks: this.hooks,
      logger: this.logger,
      messageLimit: messageLimit,
      roomId: roomId,
      roomStore: this.roomStore,
      typingIndicators: this.typingIndicators,
      userId: this.id,
      userStore: this.userStore,
    })
    this.roomSubscriptions[roomId] = roomSubscription
    return this.joinRoom(roomId)
      .then(room => roomSubscription.connect().then(() => room))
      .catch(err => {
        this.logger.warn(`error subscribing to room ${roomId}:`, err)
        throw err
      })
  }

  public subscribeToRoomMultipart(options: {
    roomId: string,
    hooks?: {
      onMessage?: (data: Message) => any,
      onNewReadCursor?: (cursor: Cursor) => void;
      onUserJoined?: (user: User) => void;
      onUserLeft?: (user: User) => void;
    },
    messageLimit?: number,
  }) {
    return this.subscribeToRoom({
      ...options,
      serverInstance: this.serverInstanceV4,
    })
  }

  public updateRoom({roomId, name, customData, isPrivate}: {
    roomId: string,
    name: string,
    customData?: any,
    isPrivate: boolean,
  }) {
    return this.serverInstanceV4
      .request({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(roomId)}`,
        json: {
          name,
          private: isPrivate,
          custom_data: customData,
        },
      })
      .then(() => {})
      .catch(err => {
        this.logger.warn("error updating room:", err)
        throw err
      })
  }

  public deleteRoom({roomId}: {roomId: string}) {
    return this.serverInstanceV4
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

  private setReadCursorRequest({roomId, position, callbacks}: { 
    roomId: string,
    position: number,
    callbacks: Callbacks[],
  }) {
    return this.cursorsInstance
      .request({
        method: "PUT",
        path: `/cursors/0/rooms/${encodeURIComponent(roomId)}/users/${
          this.encodedId
        }`,
        json: { position: position },
      })
      .then(() => map(x => x.resolve(), callbacks))
      .catch(err => {
        this.logger.warn("error setting cursor:", err)
        map(x => x.reject(err), callbacks)
      })
  }

  private uploadDataAttachment(roomId: string, {file, name}: { file: File, name: string }) {
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

  private _uploadAttachment({roomId, part}: {roomId: string; part: {
    type: string,
    name?: string,
    customData?: any,
    file: File
  }}) {
    return this.serverInstanceV4
      .request({
        method: "POST",
        path: `/rooms/${encodeURIComponent(roomId)}/attachments`,
        json: {
          content_type: part.type,
          content_length: part.file.size,
          origin: window && window.location && window.location.origin,
          name: part.name || part.file.name,
          custom_data: part.customData,
        },
      })
      .then(res => {
        const {
          attachment_id: attachmentId,
          upload_url: uploadURL,
        } = JSON.parse(res)
        return sendRawRequest({
          method: "PUT",
          url: uploadURL,
          body: part.file,
          headers: {
            "content-type": part.type,
          },
        }).then(() => ({ type: part.type, attachment: { id: attachmentId } }))
      })
  }

  private isMemberOf(roomId: string) {
    return contains(roomId, map(prop("id"), this.rooms))
  }

  private isSubscribedTo(roomId: string) {
    return has(roomId, this.roomSubscriptions)
  }

  private decorateMessage(basicMessage: BasicMessage) {
    return new Message(
      basicMessage,
      this.userStore,
      this.roomStore,
      this.serverInstanceV4,
    )
  }

  public setPropertiesFromBasicUser(basicUser: BasicUser) {
    this.avatarURL = basicUser.avatarURL
    this.createdAt = basicUser.createdAt
    this.customData = basicUser.customData
    this.name = basicUser.name
    this.updatedAt = basicUser.updatedAt
  }

  public establishUserSubscription() {
    this.userSubscription = new UserSubscription({
      hooks: this.hooks,
      userId: this.id,
      instance: this.serverInstanceV4,
      roomStore: this.roomStore,
      cursorStore: this.cursorStore,
      typingIndicators: this.typingIndicators,
      logger: this.logger,
      connectionTimeout: this.connectionTimeout,
      currentUser: this,
    })
    return this.userSubscription 
      .connect()
      .then(({basicUser, basicRooms, basicCursors}) => {
        this.setPropertiesFromBasicUser(basicUser)
        return Promise.all<(Room | Cursor)>([
          ...basicRooms.map(basicRoom => this.roomStore.set(basicRoom)),
          ...basicCursors.map(basicCursor => this.cursorStore.set(basicCursor)),
        ])
      })
      .catch(err => {
        this.logger.error("error establishing user subscription:", err)
        throw err
      })
  }

  public establishPresenceSubscription() {
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

  private subscribeToUserPresence(userId: string) {
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

  public disconnect() {
    this.userSubscription && this.userSubscription.cancel()
    this.presenceSubscription && this.presenceSubscription.cancel()
    forEachObjIndexed(sub => sub.cancel(), this.roomSubscriptions)
    forEachObjIndexed(sub => sub.cancel(), this.userPresenceSubscriptions)
  }
}

const isDataAttachment = ({file, name}: {file?: string, name?: string}) => {
  if (file === undefined || name === undefined) {
    return false
  }
  return true
}

const isLinkAttachment = ({link, type}: {link?: string, type?: string}) => {
  if (link === undefined || type === undefined) {
    return false
  }
  return true
}

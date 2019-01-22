import { CursorSubscription } from "./cursor-subscription"
import { MessageSubscription } from "./message-subscription"
import { MembershipSubscription } from "./membership-subscription"

export class RoomSubscription {
  constructor(options) {
    this.messageSub = new MessageSubscription({
      roomId: options.roomId,
      messageLimit: options.messageLimit,
      userId: options.userId,
      instance: options.apiInstance,
      userStore: options.userStore,
      roomStore: options.roomStore,
      typingIndicators: options.typingIndicators,
      logger: options.logger,
      connectionTimeout: options.connectionTimeout,
      onMessageHook: message => {
        if (
          options.hooks.rooms[options.roomId] &&
          options.hooks.rooms[options.roomId].onMessage
        ) {
          options.hooks.rooms[options.roomId].onMessage(message)
        }
      },
    })

    this.cursorSub = new CursorSubscription({
      path: `/cursors/0/rooms/${encodeURIComponent(options.roomId)}`,
      cursorStore: options.cursorStore,
      instance: options.cursorsInstance,
      logger: options.logger,
      connectionTimeout: options.connectionTimeout,
      onNewCursorHook: cursor => {
        if (
          options.hooks.rooms[options.roomId] &&
          options.hooks.rooms[options.roomId].onNewReadCursor &&
          cursor.type === 0 &&
          cursor.userId !== options.userId
        ) {
          options.hooks.rooms[options.roomId].onNewReadCursor(cursor)
        }
      },
    })

    this.membershipSub = new MembershipSubscription({
      roomId: options.roomId,
      instance: options.apiInstance,
      userStore: options.userStore,
      roomStore: options.roomStore,
      logger: options.logger,
      connectionTimeout: options.connectionTimeout,
      onUserJoinedRoomHook: (room, user) => {
        if (options.hooks.global.onUserJoinedRoom) {
          options.hooks.global.onUserJoinedRoom(room, user)
        }
        if (
          options.hooks.rooms[room.id] &&
          options.hooks.rooms[room.id].onUserJoined
        ) {
          options.hooks.rooms[room.id].onUserJoined(user)
        }
      },
      onUserLeftRoomHook: (room, user) => {
        if (options.hooks.global.onUserLeftRoom) {
          options.hooks.global.onUserLeftRoom(room, user)
        }
        if (
          options.hooks.rooms[room.id] &&
          options.hooks.rooms[room.id].onUserLeft
        ) {
          options.hooks.rooms[room.id].onUserLeft(user)
        }
      },
    })
  }

  connect() {
    if (this.cancelled) {
      return Promise.reject(
        new Error("attempt to connect a cancelled room subscription"),
      )
    }
    return Promise.all([
      this.messageSub.connect(),
      this.cursorSub.connect(),
      this.membershipSub.connect(),
    ])
  }

  cancel() {
    this.cancelled = true
    this.messageSub.cancel()
    this.cursorSub.cancel()
    this.membershipSub.cancel()
  }
}

import { CursorSubscription } from "./cursor-subscription"
import { MessageSubscription } from "./message-subscription"
import { MembershipSubscription } from "./membership-subscription"

export class RoomSubscription {
  constructor(options) {
    this.messageSub = new MessageSubscription({
      roomId: options.roomId,
      hooks: options.hooks,
      messageLimit: options.messageLimit,
      userId: options.userId,
      instance: options.apiInstance,
      userStore: options.userStore,
      roomStore: options.roomStore,
      typingIndicators: options.typingIndicators,
      logger: options.logger,
      connectionTimeout: options.connectionTimeout,
    })

    this.cursorSub = new CursorSubscription({
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
      path: `/cursors/0/rooms/${encodeURIComponent(options.roomId)}`,
      cursorStore: options.cursorStore,
      instance: options.cursorsInstance,
      logger: options.logger,
      connectionTimeout: options.connectionTimeout,
    })

    this.membershipSub = new MembershipSubscription({
      roomId: options.roomId,
      hooks: options.hooks,
      instance: options.apiInstance,
      userStore: options.userStore,
      roomStore: options.roomStore,
      logger: options.logger,
      connectionTimeout: options.connectionTimeout,
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

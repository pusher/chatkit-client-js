import { CursorSubscription } from "./cursor-subscription"
import { MessageSubscription } from "./message-subscription"
import { MembershipSubscription } from "./membership-subscription"
import { Subscription, Instance, Logger } from "@pusher/platform";
import { Room } from "./room";
import { User } from "./user";
import { UserStore } from "./user-store";
import { RoomStore } from "./room-store";
import { TypingIndicators } from "./typing-indicators";
import { Message } from "./message";
import { CursorStore } from "./cursor-store";
import { Cursor } from "./cursor";

export class RoomSubscription {
  private cancelled: boolean = false;
  private connected: boolean = false;
  private messageSub: MessageSubscription;
  private cursorSub: CursorSubscription;
  private membershipSub: MembershipSubscription;
  private buffer: (() => void)[];

  public constructor(options: {
    roomId: string;
    messageLimit?: number;
    userId: string;
    serverInstance: Instance;
    userStore: UserStore;
    roomStore: RoomStore;
    typingIndicators: TypingIndicators;
    logger: Logger;
    connectionTimeout: number;
    cursorStore: CursorStore;
    cursorsInstance: Instance;
    hooks: {
      rooms: {
        [roomId: string]: {
          onMessage?: (message: Message) => void;
          onNewReadCursor?: (cursor: Cursor) => void;
          onUserJoined?: (user: User) => void;
          onUserLeft?: (user: User) => void;
        }
      }
      global: {
        onUserJoinedRoom?: (room: Room, user: User) => void;
        onUserLeftRoom?: (room: Room, user: User) => void;
      }
    }
  }) {
    this.buffer = []

    this.messageSub = new MessageSubscription({
      roomId: options.roomId,
      messageLimit: options.messageLimit,
      userId: options.userId,
      instance: options.serverInstance,
      userStore: options.userStore,
      roomStore: options.roomStore,
      typingIndicators: options.typingIndicators,
      logger: options.logger,
      connectionTimeout: options.connectionTimeout,
      onMessageHook: this.bufferWhileConnecting((message: Message) => {
        if (
          options.hooks.rooms[options.roomId] &&
          options.hooks.rooms[options.roomId].onMessage
        ) {
          options.hooks.rooms[options.roomId].onMessage!(message)
        }
      }),
    })

    this.cursorSub = new CursorSubscription({
      roomId: options.roomId,
      cursorStore: options.cursorStore,
      instance: options.cursorsInstance,
      logger: options.logger,
      connectionTimeout: options.connectionTimeout,
      onNewCursorHook: this.bufferWhileConnecting(cursor => {
        if (
          options.hooks.rooms[options.roomId] &&
          options.hooks.rooms[options.roomId].onNewReadCursor &&
          cursor.type === 0 &&
          cursor.userId !== options.userId
        ) {
          options.hooks.rooms[options.roomId].onNewReadCursor!(cursor)
        }
      }),
    })

    this.membershipSub = new MembershipSubscription({
      roomId: options.roomId,
      instance: options.serverInstance,
      userStore: options.userStore,
      roomStore: options.roomStore,
      logger: options.logger,
      connectionTimeout: options.connectionTimeout,
      onUserJoinedRoomHook: this.bufferWhileConnecting((room, user) => {
        if (options.hooks.global.onUserJoinedRoom) {
          options.hooks.global.onUserJoinedRoom(room, user)
        }
        if (
          options.hooks.rooms[room.id] &&
          options.hooks.rooms[room.id].onUserJoined
        ) {
          options.hooks.rooms[room.id].onUserJoined!(user)
        }
      }),
      onUserLeftRoomHook: this.bufferWhileConnecting((room, user) => {
        if (options.hooks.global.onUserLeftRoom) {
          options.hooks.global.onUserLeftRoom(room, user)
        }
        if (
          options.hooks.rooms[room.id] &&
          options.hooks.rooms[room.id].onUserLeft
        ) {
          options.hooks.rooms[room.id].onUserLeft!(user)
        }
      }),
    })
  }

  public connect() {
    if (this.cancelled) {
      return Promise.reject(
        new Error("attempt to connect a cancelled room subscription"),
      )
    }
    return Promise.all([
      this.messageSub.connect(),
      this.cursorSub.connect(),
      this.membershipSub.connect(),
    ]).then(() => this.flushBuffer())
  }

  public cancel() {
    this.cancelled = true
    this.messageSub.cancel()
    this.cursorSub.cancel()
    this.membershipSub.cancel()
  }

  private bufferWhileConnecting(f: (...args: any[]) => void) {
    return (...args: any[]) => {
      if (this.connected) {
        f(...args)
      } else {
        this.buffer.push(f.bind(this, ...args))
      }
    }
  }

  private flushBuffer() {
    this.connected = true
    this.buffer.forEach(f => f())
    delete this.buffer
  }
}

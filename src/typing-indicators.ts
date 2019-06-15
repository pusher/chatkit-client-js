import { TYPING_INDICATOR_TTL, TYPING_INDICATOR_LEEWAY } from "./constants"
import { Instance, Logger } from "@pusher/platform";
import { Room } from "./room";
import { User } from "./user";

export class TypingIndicators {
  private logger: Logger;
  private instance: Instance;
  private hooks: {
    rooms: {
      [roomId: string]: {
        onUserStartedTyping?: (user: User) => void;
        onUserStoppedTyping?: (user: User) => void;
      }
    },
    global: {
      onUserStartedTyping?: (room: Room, user: User) => void;
      onUserStoppedTyping?: (room: Room, user: User) => void;
    }
  };
  private lastSentRequests: { [roomId: string]: number };
  private timers: { [roomId: string]: { [userId: string]: NodeJS.Timeout } };

  public constructor(options: {
    hooks: TypingIndicators['hooks'];
    instance: Instance;
    logger: Logger;
  }) {
    this.hooks = options.hooks
    this.instance = options.instance
    this.logger = options.logger
    this.lastSentRequests = {}
    this.timers = {}

    this.sendThrottledRequest = this.sendThrottledRequest.bind(this)
    this.onIsTyping = this.onIsTyping.bind(this)
    this.onStarted = this.onStarted.bind(this)
    this.onStopped = this.onStopped.bind(this)
  }

  public sendThrottledRequest(roomId: string): Promise<void> {
    const now = Date.now()
    const sent = this.lastSentRequests[roomId]
    if (sent && now - sent < TYPING_INDICATOR_TTL - TYPING_INDICATOR_LEEWAY) {
      return Promise.resolve()
    }
    this.lastSentRequests[roomId] = now
    return this.instance
      .request({
        method: "POST",
        path: `/rooms/${encodeURIComponent(roomId)}/typing_indicators`,
      })
      .catch(err => {
        delete this.lastSentRequests[roomId]
        this.logger.warn(
          `Error sending typing indicator in room ${roomId}`,
          err,
        )
        throw err
      })
  }

  private onIsTyping(room: Room, user: User) {
    if (!this.timers[room.id]) {
      this.timers[room.id] = {}
    }
    if (this.timers[room.id][user.id]) {
      clearTimeout(this.timers[room.id][user.id])
    } else {
      this.onStarted(room, user)
    }
    this.timers[room.id][user.id] = setTimeout(() => {
      this.onStopped(room, user)
      delete this.timers[room.id][user.id]
    }, TYPING_INDICATOR_TTL)
  }

  private onStarted(room: Room, user: User) {
    if (this.hooks.global.onUserStartedTyping) {
      this.hooks.global.onUserStartedTyping(room, user)
    }
    if (
      this.hooks.rooms[room.id] &&
      this.hooks.rooms[room.id].onUserStartedTyping
    ) {
      this.hooks.rooms[room.id].onUserStartedTyping(user)
    }
  }

  private onStopped(room: Room, user: User) {
    if (this.hooks.global.onUserStoppedTyping) {
      this.hooks.global.onUserStoppedTyping(room, user)
    }
    if (
      this.hooks.rooms[room.id] &&
      this.hooks.rooms[room.id].onUserStoppedTyping
    ) {
      this.hooks.rooms[room.id].onUserStoppedTyping(user)
    }
  }
}

import { TYPING_INDICATOR_TTL, TYPING_INDICATOR_LEEWAY } from './constants'

export class TypingIndicators {
  constructor ({ userId, instance, logger }) {
    this.userId = userId
    this.instance = instance
    this.logger = logger
    this.lastSentRequests = {}
    this.timers = {}
  }

  sendThrottledRequest = roomId => {
    const now = Date.now()
    const sent = this.lastSentRequests[roomId]
    if (sent && now - sent < TYPING_INDICATOR_TTL - TYPING_INDICATOR_LEEWAY) {
      return Promise.resolve()
    }
    this.lastSentRequests[roomId] = now
    return this.instance
      .request({
        method: 'POST',
        path: `/rooms/${roomId}/events`,
        json: {
          name: 'typing_start', // TODO 'is_typing'
          user_id: this.userId
        }
      })
      .catch(err => {
        delete this.typingRequestSent[roomId]
        this.logger.warn(
          `Error sending is_typing event in room ${roomId}`,
          err
        )
        throw err
      })
  }

  onIsTyping = (room, user, hooks, roomHooks) => {
    if (!this.timers[room.id]) {
      this.timers[room.id] = {}
    }
    if (this.timers[room.id][user.id]) {
      clearTimeout(this.timers[room.id][user.id])
    } else {
      this.onStarted(room, user, hooks, roomHooks)
    }
    this.timers[room.id][user.id] = setTimeout(() => {
      this.onStopped(room, user, hooks, roomHooks)
      delete this.timers[room.id][user.id]
    }, TYPING_INDICATOR_TTL)
  }

  onStarted = (room, user, hooks, roomHooks) => {
    if (hooks.userStartedTyping) {
      hooks.userStartedTyping(room, user)
    }
    if (roomHooks[room.id] && roomHooks[room.id].userStartedTyping) {
      roomHooks[room.id].userStartedTyping(user)
    }
  }

  onStopped = (room, user, hooks, roomHooks) => {
    if (hooks.userStoppedTyping) {
      hooks.userStoppedTyping(room, user)
    }
    if (roomHooks[room.id] && roomHooks[room.id].userStoppedTyping) {
      roomHooks[room.id].userStoppedTyping(user)
    }
  }
}

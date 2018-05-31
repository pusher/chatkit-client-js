import { TYPING_INDICATOR_TTL, TYPING_INDICATOR_LEEWAY } from './constants'

export class TypingIndicators {
  constructor ({ hooks, userId, instance, logger }) {
    this.hooks = hooks
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
          name: 'typing_start', // soon to be 'is_typing'
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

  onIsTyping = (room, user) => {
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

  onStarted = (room, user) => {
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

  onStopped = (room, user) => {
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

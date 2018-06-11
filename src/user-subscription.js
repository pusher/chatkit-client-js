import { map } from 'ramda'

import { parseBasicRoom, parseBasicUser } from './parsers'
import { SUBSCRIPTION_TIMEOUT } from './constants'

export class UserSubscription {
  constructor (options) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.typingIndicators = options.typingIndicators
    this.roomSubscriptions = options.roomSubscriptions
    this.logger = options.logger
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error('user subscription timed out'))
      }, SUBSCRIPTION_TIMEOUT)
      this.onSubscriptionEstablished = initialState => {
        clearTimeout(this.timeout)
        resolve(initialState)
      }
      this.sub = this.instance.subscribeNonResuming({
        path: '/users',
        listeners: {
          onError: err => {
            clearTimeout(this.timeout)
            reject(err)
          },
          onEvent: this.onEvent
        }
      })
    })
  }

  cancel () {
    clearTimeout(this.timeout)
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug('error when cancelling user subscription', err)
    }
  }

  onEvent = ({ body }) => {
    switch (body.event_name) {
      case 'initial_state':
        this.onInitialState(body.data)
        break
      case 'added_to_room':
        this.onAddedToRoom(body.data)
        break
      case 'removed_from_room':
        this.onRemovedFromRoom(body.data)
        break
      case 'user_joined':
        this.onUserJoined(body.data)
        break
      case 'user_left':
        this.onUserLeft(body.data)
        break
      case 'room_updated':
        this.onRoomUpdated(body.data)
        break
      case 'room_deleted':
        this.onRoomDeleted(body.data)
        break
      case 'typing_start': // soon to be 'is_typing'
        this.onIsTyping(body.data)
        break
    }
  }

  onInitialState = ({ current_user: userData, rooms: roomsData }) => {
    this.onSubscriptionEstablished({
      user: parseBasicUser(userData),
      basicRooms: map(parseBasicRoom, roomsData)
    })
  }

  onAddedToRoom = ({ room: roomData }) => {
    const basicRoom = parseBasicRoom(roomData)
    this.roomStore.set(basicRoom.id, basicRoom).then(room => {
      if (this.hooks.global.onAddedToRoom) {
        this.hooks.global.onAddedToRoom(room)
      }
    })
  }

  onRemovedFromRoom = ({ room_id: roomId }) => {
    this.roomStore.pop(roomId).then(room => {
      // room will be undefined if we left with leaveRoom
      if (room && this.hooks.global.onRemovedFromRoom) {
        this.hooks.global.onRemovedFromRoom(room)
      }
    })
  }

  onUserJoined = ({ room_id: roomId, user_id: userId }) => {
    this.roomStore.addUserToRoom(roomId, userId).then(room => {
      this.userStore.get(userId).then(user => {
        if (this.hooks.global.onUserJoinedRoom) {
          this.hooks.global.onUserJoinedRoom(room, user)
        }
        if (
          this.hooks.rooms[roomId] &&
          this.hooks.rooms[roomId].onUserJoined
        ) {
          this.hooks.rooms[roomId].onUserJoined(user)
        }
      })
    })
  }

  onUserLeft = ({ room_id: roomId, user_id: userId }) => {
    this.roomStore.removeUserFromRoom(roomId, userId).then(room => {
      this.userStore.get(userId).then(user => {
        if (this.hooks.global.onUserLeftRoom) {
          this.hooks.global.onUserLeftRoom(room, user)
        }
        if (
          this.hooks.rooms[roomId] &&
          this.hooks.rooms[roomId].onUserLeft
        ) {
          this.hooks.rooms[roomId].onUserLeft(user)
        }
      })
    })
  }

  onRoomUpdated = ({ room: roomData }) => {
    const updates = parseBasicRoom(roomData)
    this.roomStore.update(updates.id, updates).then(room => {
      if (this.hooks.global.onRoomUpdated) {
        this.hooks.global.onRoomUpdated(room)
      }
    })
  }

  onRoomDeleted = ({ room_id: roomId }) => {
    this.roomStore.pop(roomId).then(room => {
      if (room && this.hooks.global.onRoomDeleted) {
        this.hooks.global.onRoomDeleted(room)
      }
    })
  }

  onIsTyping = ({ room_id: roomId, user_id: userId }) => {
    Promise.all([this.roomStore.get(roomId), this.userStore.get(userId)])
      .then(([room, user]) => this.typingIndicators.onIsTyping(room, user))
  }
}

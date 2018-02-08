import { map } from 'ramda'

import { parseBasicRoom, parseUser } from './parsers'

export class UserSubscription {
  constructor (options) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.typingIndicators = options.typingIndicators
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.hooks = { ...this.hooks, subscriptionEstablished: resolve }
      this.instance.subscribeNonResuming({
        path: '/users',
        listeners: {
          onError: reject,
          onEvent: this.onEvent
        }
      })
    })
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
      case 'typing_start': // TODO 'is_typing'
        this.onTypingStart(body.data)
        break
    }
  }

  onInitialState = ({ current_user: userData, rooms: roomsData }) => {
    this.hooks.subscriptionEstablished({
      user: parseUser(userData),
      basicRooms: map(parseBasicRoom, roomsData)
    })
  }

  onAddedToRoom = ({ room: roomData }) => {
    // TODO fetch new user details in bulk when added to room
    const basicRoom = parseBasicRoom(roomData)
    this.roomStore.set(basicRoom.id, basicRoom).then(room => {
      if (this.hooks.addedToRoom) {
        this.hooks.addedToRoom(room)
      }
    })
  }

  onRemovedFromRoom = ({ room_id: roomId }) => {
    this.roomStore.pop(roomId).then(room => {
      if (this.hooks.removedFromRoom) {
        this.hooks.removedFromRoom(room)
      }
    })
  }

  onUserJoined = ({ room_id: roomId, user_id: userId }) => {
    this.roomStore.addUserToRoom(roomId, userId).then(() => {
      Promise.all([this.roomStore.get(roomId), this.userStore.get(userId)])
        .then(([r, u]) => {
          if (this.hooks.userJoinedRoom) {
            this.hooks.userJoinedRoom(r, u)
          }
        })
    })
  }

  onUserLeft = ({ room_id: roomId, user_id: userId }) => {
    this.roomStore.removeUserFromRoom(roomId, userId).then(() => {
      Promise.all([this.roomStore.get(roomId), this.userStore.get(userId)])
        .then(([r, u]) => {
          if (this.hooks.userLeftRoom) {
            this.hooks.userLeftRoom(r, u)
          }
        })
    })
  }

  onRoomUpdated = ({ room: roomData }) => {
    const updates = parseBasicRoom(roomData)
    this.roomStore.update(updates.id, updates).then(room => {
      if (this.hooks.roomUpdated) {
        this.hooks.roomUpdated(room)
      }
    })
  }

  onRoomDeleted = ({ room_id: roomId }) => {
    this.roomStore.pop(roomId).then(room => {
      if (room && this.hooks.roomDeleted) {
        this.hooks.roomDeleted(room)
      }
    })
  }

  onTypingStart = ({ room_id: roomId, user_id: userId }) => {
    Promise.all([this.roomStore.get(roomId), this.userStore.get(userId)])
      .then(([r, u]) => this.typingIndicators.onIsTyping(r, u, this.hooks))
  }
}

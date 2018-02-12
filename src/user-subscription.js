import { map, prop } from 'ramda'

import { parseBasicRoom, parseUser } from './parsers'

export class UserSubscription {
  constructor (options) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.typingIndicators = options.typingIndicators
    this.roomSubscriptions = options.roomSubscriptions
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
        this.onIsTyping(body.data)
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
    const basicRoom = parseBasicRoom(roomData)
    this.roomStore.set(basicRoom.id, basicRoom).then(room => {
      if (this.hooks.addedToRoom) {
        this.hooks.addedToRoom(room)
      }
    })
  }

  onRemovedFromRoom = ({ room_id: roomId }) => {
    this.roomStore.pop(roomId).then(room => {
      // room will be undefined if we left with leaveRoom
      if (room && this.hooks.removedFromRoom) {
        this.hooks.removedFromRoom(room)
      }
    })
  }

  onUserJoined = ({ room_id: roomId, user_id: userId }) => {
    this.roomStore.addUserToRoom(roomId, userId).then(room => {
      this.userStore.get(userId).then(user => {
        if (this.hooks.userJoinedRoom) {
          this.hooks.userJoinedRoom(room, user)
        }
        if (
          this.roomSubscriptions[roomId] &&
          this.roomSubscriptions[roomId].hooks.userJoined
        ) {
          this.roomSubscriptions[roomId].hooks.userJoined(user)
        }
      })
    })
  }

  onUserLeft = ({ room_id: roomId, user_id: userId }) => {
    this.roomStore.removeUserFromRoom(roomId, userId).then(room => {
      this.userStore.get(userId).then(user => {
        if (this.hooks.userLeftRoom) {
          this.hooks.userLeftRoom(room, user)
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

  onIsTyping = ({ room_id: roomId, user_id: userId }) => {
    Promise.all([this.roomStore.get(roomId), this.userStore.get(userId)])
      .then(([room, user]) => this.typingIndicators.onIsTyping(
        room,
        user,
        this.hooks,
        map(prop('hooks'), this.roomSubscriptions)
      ))
  }
}

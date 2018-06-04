import { map } from 'ramda'

import { parseBasicRoom, parseBasicUser } from './parsers'

export class UserSubscription {
  constructor (options) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.roomSubscriptions = options.roomSubscriptions
    this.logger = options.logger
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.onSubscriptionEstablished = resolve
      this.sub = this.instance.subscribeNonResuming({
        path: '/users',
        listeners: {
          onError: reject,
          onEvent: this.onEvent
        }
      })
    })
  }

  cancel () {
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
      case 'room_updated':
        this.onRoomUpdated(body.data)
        break
      case 'room_deleted':
        this.onRoomDeleted(body.data)
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
      this.hooks.internal.onAddedToRoom(basicRoom.id).then(() => {
        if (this.hooks.global.onAddedToRoom) {
          this.hooks.global.onAddedToRoom(room)
        }
      })
    })
  }

  onRemovedFromRoom = ({ room_id: roomId }) => {
    this.roomStore.pop(roomId).then(room => {
      this.hooks.internal.onRemovedFromRoom(roomId).then(() => {
        // room will be undefined if we left with leaveRoom
        if (room && this.hooks.global.onRemovedFromRoom) {
          this.hooks.global.onRemovedFromRoom(room)
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
}

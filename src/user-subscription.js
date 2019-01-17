import { parseBasicRoom, parseBasicUser } from "./parsers"
import { handleUserSubReconnection } from "./reconnection-handlers"

export class UserSubscription {
  constructor(options) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.roomStore = options.roomStore
    this.roomSubscriptions = options.roomSubscriptions
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout
    this.currentUser = options.currentUser

    this.connect = this.connect.bind(this)
    this.cancel = this.cancel.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.onInitialState = this.onInitialState.bind(this)
    this.onAddedToRoom = this.onAddedToRoom.bind(this)
    this.onRemovedFromRoom = this.onRemovedFromRoom.bind(this)
    this.onRoomUpdated = this.onRoomUpdated.bind(this)
    this.onRoomDeleted = this.onRoomDeleted.bind(this)
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("user subscription timed out"))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = initialState => {
        clearTimeout(this.timeout)
        resolve(initialState)
      }
      this.sub = this.instance.subscribeNonResuming({
        path: "/users",
        listeners: {
          onError: err => {
            clearTimeout(this.timeout)
            reject(err)
          },
          onEvent: this.onEvent,
        },
      })
    })
  }

  cancel() {
    clearTimeout(this.timeout)
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug("error when cancelling user subscription", err)
    }
  }

  onEvent({ body }) {
    switch (body.event_name) {
      case "initial_state":
        this.onInitialState(body.data)
        break
      case "added_to_room":
        this.onAddedToRoom(body.data)
        break
      case "removed_from_room":
        this.onRemovedFromRoom(body.data)
        break
      case "room_updated":
        this.onRoomUpdated(body.data)
        break
      case "room_deleted":
        this.onRoomDeleted(body.data)
        break
    }
  }

  onInitialState({ current_user: userData, rooms: roomsData }) {
    const basicUser = parseBasicUser(userData)
    const basicRooms = roomsData.map(d => parseBasicRoom(d))
    if (!this.established) {
      this.established = true
      this.onSubscriptionEstablished({ basicUser, basicRooms })
    } else {
      handleUserSubReconnection({
        basicUser,
        basicRooms,
        currentUser: this.currentUser,
        roomStore: this.roomStore,
        hooks: this.hooks,
      })
    }
  }

  onAddedToRoom({ room: roomData }) {
    this.roomStore.set(parseBasicRoom(roomData)).then(room => {
      if (this.hooks.global.onAddedToRoom) {
        this.hooks.global.onAddedToRoom(room)
      }
    })
  }

  onRemovedFromRoom({ room_id: roomId }) {
    this.roomStore.pop(roomId).then(room => {
      if (room && this.hooks.global.onRemovedFromRoom) {
        this.hooks.global.onRemovedFromRoom(room)
      }
    })
  }

  onRoomUpdated({ room: roomData }) {
    const updates = parseBasicRoom(roomData)
    this.roomStore.update(updates.id, updates).then(room => {
      if (this.hooks.global.onRoomUpdated) {
        this.hooks.global.onRoomUpdated(room)
      }
    })
  }

  onRoomDeleted({ room_id: roomId }) {
    this.roomStore.pop(roomId).then(room => {
      if (room && this.hooks.global.onRoomDeleted) {
        this.hooks.global.onRoomDeleted(room)
      }
    })
  }
}

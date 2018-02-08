import { map } from 'ramda'

import { parseBasicRoom, parseUser } from './parsers'

export class UserSubscription {
  constructor ({ hooks, apiInstance, userStore, roomStore, typingIndicators }) {
    this.hooks = hooks
    this.apiInstance = apiInstance
    this.userStore = userStore
    this.roomStore = roomStore
    this.typingIndicators = typingIndicators
  }

  connect = () => new Promise((resolve, reject) => {
    this.hooks.subscriptionEstablished = resolve
    this.apiInstance.subscribeNonResuming({
      path: '/users',
      listeners: {
        onError: reject,
        onEvent: this.onEvent
      }
    })
  })

  onEvent = ({ body }) => {
    switch (body.event_name) {
      case 'initial_state':
        this.onInitialState(body.data)
        break
      case 'added_to_room':
        // TODO fetch new user details in bulk when added to room (etc)
        const basicRoom = parseBasicRoom(body.data.room)
        this.roomStore.set(basicRoom.id, basicRoom).then(room => {
          if (this.hooks.addedToRoom) {
            this.hooks.addedToRoom(room)
          }
        })
        break
      case 'removed_from_room':
        this.roomStore.pop(body.data.room_id).then(room => {
          if (this.hooks.removedFromRoom) {
            this.hooks.removedFromRoom(room)
          }
        })
        break
      case 'user_joined':
        console.log('user_joined', body.data)
        break
      case 'user_left':
        console.log('user_left', body.data)
        // const { room_id: roomId, user_id: userId } = body.data
        // this.roomStore.removeUserFromRoom(roomId, userId)
        // if (this.hooks.userLeftRoom) {
        //   Promise.all([this.roomStore.get(roomId), this.userStore.get(userId)])
        //     .then(([r, u]) => this.hooks.userLeftRoom(r, u))
        // }
        break
      case 'typing_start': // TODO 'is_typing'
        const { room_id: roomId, user_id: userId } = body.data
        Promise.all([this.roomStore.get(roomId), this.userStore.get(userId)])
          .then(([r, u]) => this.typingIndicators.onIsTyping(r, u, this.hooks))
        break
    }
  }

  onInitialState = ({ current_user: userData, rooms: roomsData }) => {
    this.hooks.subscriptionEstablished({
      user: parseUser(userData),
      basicRooms: map(parseBasicRoom, roomsData)
    })
  }
}

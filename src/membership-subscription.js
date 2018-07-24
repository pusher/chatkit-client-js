export class MembershipSubscription {
  constructor (options) {
    this.roomId = options.roomId
    this.hooks = options.hooks
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error('membership subscription timed out'))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = initialState => {
        clearTimeout(this.timeout)
        resolve(initialState)
      }
      this.sub = this.instance.subscribeNonResuming({
        path: `/rooms/${this.roomId}/memberships`,
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
      this.logger.debug('error when cancelling membership subscription', err)
    }
  }

  onEvent = ({ body }) => {
    switch (body.event_name) {
      case 'initial_state':
        this.onInitialState(body.data)
        break
      case 'user_joined':
        this.onUserJoined(body.data)
        break
      case 'user_left':
        this.onUserLeft(body.data)
        break
    }
  }

  onInitialState = ({ user_ids: userIds }) => {
    this.roomStore.update(this.roomId, { userIds })
      .then(() => {
        this.onSubscriptionEstablished()
      })
  }

  onUserJoined = ({ user_id: userId }) => {
    this.roomStore.addUserToRoom(this.roomId, userId).then(room => {
      this.userStore.get(userId).then(user => {
        if (this.hooks.global.onUserJoinedRoom) {
          this.hooks.global.onUserJoinedRoom(room, user)
        }
        if (
          this.hooks.rooms[this.roomId] &&
          this.hooks.rooms[this.roomId].onUserJoined
        ) {
          this.hooks.rooms[this.roomId].onUserJoined(user)
        }
      })
    })
  }

  onUserLeft = ({ user_id: userId }) => {
    this.roomStore.removeUserFromRoom(this.roomId, userId).then(room => {
      this.userStore.get(userId).then(user => {
        if (this.hooks.global.onUserLeftRoom) {
          this.hooks.global.onUserLeftRoom(room, user)
        }
        if (
          this.hooks.rooms[this.roomId] &&
          this.hooks.rooms[this.roomId].onUserLeft
        ) {
          this.hooks.rooms[this.roomId].onUserLeft(user)
        }
      })
    })
  }
}

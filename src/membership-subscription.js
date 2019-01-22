import { handleMembershipSubReconnection } from "./reconnection-handlers"

export class MembershipSubscription {
  constructor(options) {
    this.roomId = options.roomId
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout
    this.onUserJoinedRoomHook = options.onUserJoinedRoomHook
    this.onUserLeftRoomHook = options.onUserLeftRoomHook

    this.connect = this.connect.bind(this)
    this.cancel = this.cancel.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.onInitialState = this.onInitialState.bind(this)
    this.onUserJoined = this.onUserJoined.bind(this)
    this.onUserLeft = this.onUserLeft.bind(this)
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("membership subscription timed out"))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = initialState => {
        clearTimeout(this.timeout)
        resolve(initialState)
      }
      this.sub = this.instance.subscribeNonResuming({
        path: `/rooms/${encodeURIComponent(this.roomId)}/memberships`,
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
      this.logger.debug("error when cancelling membership subscription", err)
    }
  }

  onEvent({ body }) {
    switch (body.event_name) {
      case "initial_state":
        this.onInitialState(body.data)
        break
      case "user_joined":
        this.onUserJoined(body.data)
        break
      case "user_left":
        this.onUserLeft(body.data)
        break
    }
  }

  onInitialState({ user_ids: userIds }) {
    if (!this.established) {
      this.established = true
      this.roomStore.update(this.roomId, { userIds }).then(() => {
        this.onSubscriptionEstablished()
      })
    } else {
      handleMembershipSubReconnection({
        userIds,
        roomId: this.roomId,
        roomStore: this.roomStore,
        userStore: this.userStore,
        onUserJoinedRoomHook: this.onUserJoinedRoomHook,
        onUserLeftRoomHook: this.onUserLeftRoomHook,
      })
    }
  }

  onUserJoined({ user_id: userId }) {
    this.roomStore
      .addUserToRoom(this.roomId, userId)
      .then(room =>
        this.userStore
          .get(userId)
          .then(user => this.onUserJoinedRoomHook(room, user)),
      )
  }

  onUserLeft({ user_id: userId }) {
    this.roomStore
      .removeUserFromRoom(this.roomId, userId)
      .then(room =>
        this.userStore
          .get(userId)
          .then(user => this.onUserLeftRoomHook(room, user)),
      )
  }
}

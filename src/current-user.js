import { append, map } from 'ramda'

const parseRoom = data => ({
  createdAt: data.created_at,
  createdByUserId: data.created_by_id,
  deletedAt: data.deletedAt,
  id: data.id,
  isPrivate: data.private,
  name: data.name,
  updatedAt: data.updated_at,
  userIds: data.member_user_ids
})

export class CurrentUser {
  constructor ({ apiInstance }) {
    this.apiInstance = apiInstance
  }

  /* public */

  /* internal */
  establishUserSubscription = hooks => new Promise((resolve, reject) =>
    this.apiInstance.subscribeNonResuming({
      path: '/users',
      listeners: {
        onError: reject,
        onEvent: this.onEvent({
          ...hooks,
          subscriptionEstablished: resolve
        })
      }
    })
  )

  onEvent = hooks => ({ body }) => {
    switch (body.event_name) {
      case 'initial_state':
        this.onInitialState(body.data)
        if (hooks.subscriptionEstablished) {
          hooks.subscriptionEstablished()
        }
        break
      case 'added_to_room':
        const room = parseRoom(body.data.room)
        this.rooms = append(room, this.rooms)
        if (hooks.addedToRoom) {
          hooks.addedToRoom(room)
        }
        break
    }
  }

  onInitialState = ({ current_user: currentUser, rooms }) => {
    this.avatarURL = currentUser.avatar_url
    this.createdAt = currentUser.created_at
    this.customData = currentUser.custom_data
    this.id = currentUser.id
    this.name = currentUser.name
    this.updatedAt = currentUser.updated_at
    this.rooms = map(parseRoom, rooms)
  }
}

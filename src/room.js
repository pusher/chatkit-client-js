import { contains, filter, values } from 'ramda'

export class Room {
  constructor ({ basicRoom, userStore, isSubscribedTo, logger }) {
    this.createdAt = basicRoom.createdAt
    this.createdByUserId = basicRoom.createdByUserId
    this.deletedAt = basicRoom.deletedAt
    this.id = basicRoom.id
    this.isPrivate = basicRoom.isPrivate
    this.name = basicRoom.name
    this.updatedAt = basicRoom.updatedAt
    this.userIds = []
    this.userStore = userStore
    this.isSubscribedTo = isSubscribedTo
    this.logger = logger
  }

  get users () {
    if (!this.isSubscribedTo(this.id)) {
      const err = new Error(
        `Must be subscribed to room ${this.id} to access users property`
      )
      this.logger.error(err)
      throw err
    }
    return filter(
      user => contains(user.id, this.userIds),
      values(this.userStore.snapshot())
    )
  }
}

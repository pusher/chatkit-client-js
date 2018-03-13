import { contains, filter, values } from 'ramda'

export class Room {
  constructor (basicRoom, userStore) {
    this.createdAt = basicRoom.createdAt
    this.createdByUserId = basicRoom.createdByUserId
    this.deletedAt = basicRoom.deletedAt
    this.id = basicRoom.id
    this.isPrivate = basicRoom.isPrivate
    this.name = basicRoom.name
    this.updatedAt = basicRoom.updatedAt
    this.userIds = basicRoom.userIds
    this.userStore = userStore
  }

  get users () {
    return filter(
      user => contains(user.id, this.userIds),
      values(this.userStore.snapshot())
    )
  }
}

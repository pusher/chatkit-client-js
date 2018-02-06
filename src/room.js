import { map } from 'ramda'

export class Room {
  constructor (options) {
    this.createdAt = options.createdAt
    this.createdByUserId = options.createdByUserId
    this.deletedAt = options.deletedAt
    this.id = options.id
    this.isPrivate = options.isPrivate
    this.name = options.name
    this.updatedAt = options.updatedAt
    this.userIds = options.userIds
    this.userStore = options.userStore
  }

  getUsers = () => Promise.all(map(this.userStore.get, this.userIds))
}

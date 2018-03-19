import { append, map, filter, uniq, curry, pipe } from 'ramda'

import { Store } from './store'
import { parseBasicRoom } from './parsers'
import { Room } from './room'

export class RoomStore {
  constructor ({ instance, userStore, logger }) {
    this.instance = instance
    this.userStore = userStore
    this.logger = logger
  }

  store = new Store()

  initialize = initial => {
    this.store.initialize(map(this.decorate, initial))
  }

  set = curry((roomId, basicRoom) => {
    return this.store.set(roomId, this.decorate(basicRoom))
      .then(room =>
        this.userStore.fetchMissingUsers(room.userIds).then(() => room)
      )
  })

  get = roomId => this.store.get(roomId).then(room =>
    room || this.fetchBasicRoom(roomId).then(this.set(roomId))
  )

  pop = this.store.pop

  addUserToRoom = (roomId, userId) => this.store.update(roomId, r => {
    r.userIds = uniq(append(userId, r.userIds))
    return r
  })

  removeUserFromRoom = (roomId, userId) => this.store.update(roomId, r => {
    r.userIds = filter(id => id !== userId, r.userIds)
    return r
  })

  update = (roomId, updates) => this.store.update(roomId, r => {
    r.createdAt = updates.createdAt || r.createdAt
    r.createdByUserId = updates.createdByUserId || r.createdByUserId
    r.deletedAt = updates.deletedAt || r.deletedAt
    r.id = updates.id || r.id
    r.isPrivate = updates.isPrivate || r.isPrivate
    r.name = updates.name || r.name
    r.updatedAt = updates.updatedAt || r.updatedAt
    r.userIds = updates.userIds || r.userIds
    return r
  })

  fetchBasicRoom = roomId => {
    return this.instance
      .request({
        method: 'GET',
        path: `/rooms/${roomId}`
      })
      .then(pipe(JSON.parse, parseBasicRoom))
      .catch(err => {
        this.logger.warn(`error fetching details for room ${roomId}:`, err)
      })
  }

  snapshot = this.store.snapshot

  getSync = this.store.getSync

  decorate = basicRoom => {
    return basicRoom
      ? new Room(basicRoom, this.userStore)
      : undefined
  }
}

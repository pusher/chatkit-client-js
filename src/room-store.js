import { append, map, filter, uniq, pipe } from 'ramda'

import { Store } from './store'
import { parseBasicRoom } from './parsers'
import { Room } from './room'

export class RoomStore {
  constructor (options) {
    this.instance = options.instance
    this.userStore = options.userStore
    this.isSubscribedTo = options.isSubscribedTo
    this.logger = options.logger
  }

  store = new Store()

  initialize = initial => {
    this.store.initialize(map(this.decorate, initial))
  }

  set = (roomId, basicRoom) => {
    const room = this.store.getSync(roomId)
    if (room) {
      return Promise.resolve(room)
    }
    return this.store.set(roomId, this.decorate(basicRoom))
  }

  get = roomId => this.store.get(roomId).then(room =>
    room || this.fetchBasicRoom(roomId).then(basicRoom => this.set(roomId, basicRoom))
  )

  pop = this.store.pop

  addUserToRoom = (roomId, userId) => {
    return Promise.all([
      this.store.update(roomId, r => {
        r.userIds = uniq(append(userId, r.userIds))
        return r
      }),
      this.userStore.fetchMissingUsers([userId])
    ])
      .then(([room]) => room)
  }

  removeUserFromRoom = (roomId, userId) => this.store.update(roomId, r => {
    r.userIds = filter(id => id !== userId, r.userIds)
    return r
  })

  update = (roomId, updates) => {
    return Promise.all([
      this.store.update(roomId, r => {
        r.createdAt = updates.createdAt || r.createdAt
        r.createdByUserId = updates.createdByUserId || r.createdByUserId
        r.deletedAt = updates.deletedAt || r.deletedAt
        r.id = updates.id || r.id
        r.isPrivate = updates.isPrivate || r.isPrivate
        r.name = updates.name || r.name
        r.updatedAt = updates.updatedAt || r.updatedAt
        r.userIds = updates.userIds || r.userIds
        return r
      }),
      this.userStore.fetchMissingUsers(updates.userIds || [])
    ])
      .then(([room]) => room)
  }

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
      ? new Room({
        basicRoom,
        userStore: this.userStore,
        isSubscribedTo: this.isSubscribedTo,
        logger: this.logger
      })
      : undefined
  }
}

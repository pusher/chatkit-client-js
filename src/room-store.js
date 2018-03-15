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

  pop = roomId => this.store.pop(roomId).then(room =>
    room || this.fetchBasicRoom(roomId).then(this.decorate)
  )

  update = (roomId, updates) => this.store.pop(roomId).then(r =>
    this.set(roomId, mergeWith((x, y) => y || x, r, updates))
  )

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

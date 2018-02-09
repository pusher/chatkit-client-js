import { append, map, mergeWith, filter, uniq } from 'ramda'

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

  initialize = this.store.initialize

  set = (roomId, basicRoom) => {
    return this.store.set(roomId, basicRoom)
      .then(this.decorate)
      .then(room =>
        this.userStore.fetchMissingUsers(room.userIds).then(() => room)
      )
  }

  get = roomId => this.store.get(roomId).then(basicRoom =>
    basicRoom || this.fetchBasicRoom(roomId)
  ).then(this.decorate)

  pop = roomId => this.store.pop(roomId).then(this.decorate)

  addUserToRoom = (roomId, userId) => this.store.pop(roomId).then(r =>
    this.set(roomId, { ...r, userIds: uniq(append(userId, r.userIds)) })
  )

  removeUserFromRoom = (roomId, userId) => this.store.pop(roomId).then(r =>
    this.set(roomId, { ...r, userIds: filter(id => id !== userId, r.userIds) })
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
      .then(res => {
        const basicRoom = parseBasicRoom(JSON.parse(res))
        this.set(roomId, basicRoom)
        return basicRoom
      })
      .catch(err => {
        this.logger.warn('error fetching room information:', err)
        throw err
      })
  }

  snapshot = () => map(this.decorate, this.store.snapshot())

  getSync = key => this.decorate(this.store.getSync(key))

  decorate = basicRoom => basicRoom
    ? new Room(basicRoom, this.userStore)
    : undefined
}

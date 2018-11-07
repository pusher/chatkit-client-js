import { append, map, filter, uniq, pipe } from "ramda"

import { Store } from "./store"
import { parseBasicRoom } from "./parsers"
import { Room } from "./room"

export class RoomStore {
  constructor(options) {
    this.instance = options.instance
    this.userStore = options.userStore
    this.isSubscribedTo = options.isSubscribedTo
    this.logger = options.logger
    this.store = new Store()

    this.initialize = this.initialize.bind(this)
    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.pop = this.pop.bind(this)
    this.addUserToRoom = this.addUserToRoom.bind(this)
    this.removeUserFromRoom = this.removeUserFromRoom.bind(this)
    this.update = this.update.bind(this)
    this.fetchBasicRoom = this.fetchBasicRoom.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.getSync = this.getSync.bind(this)
    this.decorate = this.decorate.bind(this)
  }

  initialize(initial) {
    this.store.initialize(map(this.decorate, initial))
  }

  set(roomId, basicRoom) {
    const room = this.store.getSync(roomId)
    if (room) {
      return Promise.resolve(room)
    }
    return this.store.set(roomId, this.decorate(basicRoom))
  }

  get(roomId) {
    return this.store
      .get(roomId)
      .then(
        room =>
          room ||
          this.fetchBasicRoom(roomId).then(basicRoom =>
            this.set(roomId, basicRoom),
          ),
      )
  }

  pop(...x) {
    return this.store.pop(...x)
  }

  addUserToRoom(roomId, userId) {
    return Promise.all([
      this.store.update(roomId, r => {
        r.userIds = uniq(append(userId, r.userIds))
        return r
      }),
      this.userStore.fetchMissingUsers([userId]),
    ]).then(([room]) => room)
  }

  removeUserFromRoom(roomId, userId) {
    return this.store.update(roomId, r => {
      r.userIds = filter(id => id !== userId, r.userIds)
      return r
    })
  }

  update(roomId, updates) {
    return Promise.all([
      this.store.update(roomId, r => {
        for (const k in updates) {
          r[k] = updates[k]
        }
        return r
      }),
      this.userStore.fetchMissingUsers(updates.userIds || []),
    ]).then(([room]) => room)
  }

  fetchBasicRoom(roomId) {
    return this.instance
      .request({
        method: "GET",
        path: `/rooms/${encodeURIComponent(roomId)}`,
      })
      .then(
        pipe(
          JSON.parse,
          parseBasicRoom,
        ),
      )
      .catch(err => {
        this.logger.warn(`error fetching details for room ${roomId}:`, err)
      })
  }

  snapshot(...x) {
    return this.store.snapshot(...x)
  }

  getSync(...x) {
    return this.store.getSync(...x)
  }

  decorate(basicRoom) {
    return basicRoom
      ? new Room({
          basicRoom,
          userStore: this.userStore,
          isSubscribedTo: this.isSubscribedTo,
          logger: this.logger,
        })
      : undefined
  }
}

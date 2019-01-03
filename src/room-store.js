import { append, uniq, pipe } from "ramda"

import { parseBasicRoom } from "./parsers"
import { Room } from "./room"

export class RoomStore {
  constructor(options) {
    this.instance = options.instance
    this.userStore = options.userStore
    this.isSubscribedTo = options.isSubscribedTo
    this.logger = options.logger
    this.rooms = {}

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

  set(basicRoom) {
    if (!this.rooms[basicRoom.id]) {
      this.rooms[basicRoom.id] = this.decorate(basicRoom)
    }
    return Promise.resolve(this.rooms[basicRoom.id])
  }

  get(roomId) {
    return Promise.resolve(this.rooms[roomId]).then(
      room =>
        room ||
        this.fetchBasicRoom(roomId).then(basicRoom =>
          this.set(roomId, basicRoom),
        ),
    )
  }

  pop(roomId) {
    const room = this.rooms[roomId]
    delete this.rooms[roomId]
    return Promise.resolve(room)
  }

  addUserToRoom(roomId, userId) {
    return Promise.all([
      this.get(roomId).then(room => {
        room.userIds = uniq(append(userId, room.userIds))
        return room
      }),
      this.userStore.fetchMissingUsers([userId]),
    ]).then(([room]) => room)
  }

  removeUserFromRoom(roomId, userId) {
    return this.get(roomId).then(room => {
      room.userIds = room.userIds.filter(id => id !== userId)
      return room
    })
  }

  update(roomId, updates) {
    return Promise.all([
      this.get(roomId).then(room => {
        for (const k in updates) {
          room[k] = updates[k]
        }
        return room
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

  snapshot() {
    return this.rooms
  }

  getSync(roomId) {
    return this.rooms[roomId]
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

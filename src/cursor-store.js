import { Cursor } from "./cursor"
import { parseBasicCursor } from "./parsers"

export class CursorStore {
  constructor({ instance, userStore, roomStore, logger }) {
    this.instance = instance
    this.userStore = userStore
    this.roomStore = roomStore
    this.logger = logger
    this.cursors = {}

    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.getSync = this.getSync.bind(this)
    this.fetchBasicCursor = this.fetchBasicCursor.bind(this)
    this.decorate = this.decorate.bind(this)
  }

  set(basicCursor) {
    const k = key(basicCursor.userId, basicCursor.roomId)
    this.cursors[k] = this.decorate(basicCursor)
    return this.userStore
      .fetchMissingUser(basicCursor.userId)
      .then(() => this.cursors[k])
  }

  get(userId, roomId) {
    const k = key(userId, roomId)
    if (this.cursors[k]) {
      return Promise.resolve(this.cursors[k])
    }
    return this.fetchBasicCursor(userId, roomId).then(basicCursor =>
      this.set(basicCursor),
    )
  }

  getSync(userId, roomId) {
    return this.cursors[key(userId, roomId)]
  }

  fetchBasicCursor(userId, roomId) {
    return this.instance
      .request({
        method: "GET",
        path: `/cursors/0/rooms/${encodeURIComponent(
          roomId,
        )}/users/${encodeURIComponent(userId)}`,
      })
      .then(res => {
        const data = JSON.parse(res)
        if (data) {
          return parseBasicCursor(data)
        }
        return undefined
      })
      .catch(err => {
        this.logger.warn("error fetching cursor:", err)
        throw err
      })
  }

  decorate(basicCursor) {
    return basicCursor
      ? new Cursor(basicCursor, this.userStore, this.roomStore)
      : undefined
  }
}

const key = (userId, roomId) =>
  `${encodeURIComponent(userId)}/${encodeURIComponent(roomId)}`

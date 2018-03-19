import { map } from 'ramda'

import { Store } from './store'
import { Cursor } from './cursor'
import { parseBasicCursor } from './parsers'

export class CursorStore {
  constructor ({ instance, userStore, roomStore, logger }) {
    this.instance = instance
    this.userStore = userStore
    this.roomStore = roomStore
    this.logger = logger
  }

  store = new Store()

  initialize = initial => {
    this.store.initialize(map(this.decorate, initial))
  }

  set = (userId, roomId, cursor) => this.store.set(
    key(userId, roomId),
    this.decorate(cursor)
  )

  get = (userId, roomId) => {
    return this.store.get(key(userId, roomId))
      .then(cursor => cursor || this.fetchBasicCursor(userId, roomId)
        .then(cursor => this.set(userId, roomId, cursor))
      )
  }

  getSync = (userId, roomId) => {
    return this.store.getSync(key(userId, roomId))
  }

  fetchBasicCursor = (userId, roomId) => {
    return this.instance
      .request({
        method: 'GET',
        path: `/cursors/0/rooms/${roomId}/users/${encodeURIComponent(userId)}`
      })
      .then(res => {
        const data = JSON.parse(res)
        if (data) {
          return parseBasicCursor(data)
        }
        return undefined
      })
      .catch(err => {
        this.logger.warn('error fetching cursor:', err)
        throw err
      })
  }

  decorate = basicCursor => {
    return basicCursor
      ? new Cursor(basicCursor, this.userStore, this.roomStore)
      : undefined
  }
}

const key = (userId, roomId) => `${userId}/${roomId}`

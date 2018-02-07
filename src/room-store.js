import { map } from 'ramda'

import { Store } from './store'
import { parseBasicRoom } from './parsers'
import { Room } from './room'

export class RoomStore {
  constructor ({ apiInstance, userStore, logger }) {
    this.apiInstance = apiInstance
    this.userStore = userStore
    this.logger = logger
  }

  store = new Store()

  initialize = this.store.initialize

  set = this.store.set

  get = roomId => this.store.get(roomId).then(basicRoom =>
    basicRoom || this.fetchBasicRoom(roomId)
  ).then(this.decorate)

  pop = roomId => this.store.pop(roomId).then(this.decorate)

  fetchBasicRoom = roomId => {
    return this.apiInstance
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

  decorate = basicRoom => basicRoom
    ? new Room(basicRoom, this.userStore)
    : undefined

  snapshot = () => map(this.decorate, this.store.snapshot())
}

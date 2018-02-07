import { Store } from './store'
import { parseUser } from './parsers'

export class UserStore {
  constructor ({ apiInstance, presenceStore, logger }) {
    this.apiInstance = apiInstance
    this.presenceStore = presenceStore
    this.logger = logger
  }

  store = new Store()

  initialize = this.store.initialize

  set = this.store.set

  get = userId => Promise.all([
    this.store.get(userId).then(user => user || this.fetchUser(userId)),
    this.presenceStore.get(userId)
  ]).then(([user, presence]) => ({ ...user, presence }))

  fetchUser = userId => {
    return this.apiInstance
      .request({
        method: 'GET',
        path: `/users/${userId}`
      })
      .then(res => {
        const user = parseUser(JSON.parse(res))
        this.set(userId, user)
        return user
      })
      .catch(err => {
        this.logger.warn('error fetching user information:', err)
        throw err
      })
  }
}

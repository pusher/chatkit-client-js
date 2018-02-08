import { difference, join, length, map, pipe, prop, forEach } from 'ramda'

import { appendQueryParam } from './utils'
import { Store } from './store'
import { parseUser } from './parsers'

export class UserStore {
  constructor ({ instance, presenceStore, logger }) {
    this.instance = instance
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
    return this.instance
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

  fetchMissingUsers = userIds => {
    const missing = difference(userIds, map(prop('id'), this.store.snapshot()))
    if (length(missing) === 0) {
      return Promise.resolve()
    }
    return this.instance
      .request({
        method: 'GET',
        path: appendQueryParam('user_ids', join(',', missing), '/users_by_ids')
      })
      .then(pipe(
        JSON.parse,
        map(parseUser),
        forEach(user => this.set(user.id, user))
      ))
      .catch(err => {
        this.logger.warn('error fetching missing users:', err)
        throw err
      })
  }

  snapshot = () => {
    const presenceSnapshot = this.presenceStore.snapshot()
    return map(
      user => ({ ...user, presence: presenceSnapshot[user.id] }),
      this.store.snapshot()
    )
  }
}

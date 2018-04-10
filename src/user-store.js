import {
  difference,
  forEach,
  join,
  keys,
  length,
  map,
  pick,
  prop,
  values
} from 'ramda'

import { appendQueryParams } from './utils'
import { Store } from './store'
import { parseBasicUser } from './parsers'
import { User } from './user'

export class UserStore {
  constructor ({ instance, presenceStore, logger }) {
    this.instance = instance
    this.presenceStore = presenceStore
    this.logger = logger
    this.reqs = {} // ongoing requests by userId
  }

  store = new Store()

  initialize = initial => {
    this.store.initialize(map(this.decorate, initial))
  }

  set = (userId, basicUser) => this.store.set(userId, this.decorate(basicUser))

  get = userId => Promise.all([
    this.fetchUser(userId),
    this.presenceStore.get(userId) // Make sure it's safe to getSync
  ]).then(([user, _presence]) => user)

  fetchUser = userId => {
    return this.fetchMissingUsers([userId]).then(() => this.store.get(userId))
  }

  fetchMissingUsers = userIds => {
    const missing = difference(
      userIds,
      map(prop('id'), values(this.store.snapshot()))
    )
    const missingNotInProgress = difference(missing, keys(this.reqs))
    if (length(missingNotInProgress) > 0) {
      this.fetchBasicUsers(missingNotInProgress)
    }
    return Promise.all(values(pick(userIds, this.reqs)))
  }

  fetchBasicUsers = userIds => {
    const req = this.instance
      .request({
        method: 'GET',
        path: appendQueryParams(
          { user_ids: join(',', userIds) },
          '/users_by_ids'
        )
      })
      .then(res => {
        const users = map(parseBasicUser, JSON.parse(res))
        forEach(user => this.set(user.id, user), users)
        forEach(userId => {
          delete this.reqs[userId]
        }, userIds)
        return users
      })
      .catch(err => {
        this.logger.warn('error fetching missing users:', err)
        throw err
      })
    forEach(userId => {
      this.reqs[userId] = req
    }, userIds)
  }

  snapshot = this.store.snapshot

  getSync = this.store.getSync

  decorate = basicUser => {
    return basicUser
      ? new User(basicUser, this.presenceStore)
      : undefined
  }
}

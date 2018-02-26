import {
  difference,
  forEach,
  join,
  length,
  map,
  pipe,
  prop,
  values
} from 'ramda'

import { appendQueryParam } from './utils'
import { Store } from './store'
import { parseBasicUser } from './parsers'
import { User } from './user'

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
    this.store.get(userId).then(user => user || this.fetchBasicUser(userId)),
    this.presenceStore.get(userId) // Make sure it's safe to getSync
  ]).then(([user, presence]) => this.decorate(user))

  fetchBasicUser = userId => {
    return this.instance
      .request({
        method: 'GET',
        path: `/users/${encodeURIComponent(userId)}`
      })
      .then(res => {
        const user = parseBasicUser(JSON.parse(res))
        this.set(userId, user)
        return user
      })
      .catch(err => {
        this.logger.warn('error fetching user information:', err)
        throw err
      })
  }

  fetchMissingUsers = userIds => {
    const missing = difference(
      userIds,
      map(prop('id'), values(this.store.snapshot()))
    )
    if (length(missing) === 0) {
      return Promise.resolve()
    }
    // TODO don't make simulatneous requests for the same users (question: what
    // will actually cause this situation to arise? Receiving lots of messages
    // in a room from a user who is no longer a member of said room?)
    return this.instance
      .request({
        method: 'GET',
        path: appendQueryParam('user_ids', join(',', missing), '/users_by_ids')
      })
      .then(pipe(
        JSON.parse,
        map(parseBasicUser),
        forEach(user => this.set(user.id, user))
      ))
      .catch(err => {
        this.logger.warn('error fetching missing users:', err)
        throw err
      })
  }

  snapshot = () => map(this.decorate, this.store.snapshot())

  getSync = userId => this.decorate(this.store.getSync(userId))

  decorate = basicUser => {
    return basicUser
      ? new User(basicUser, this.presenceStore)
      : undefined
  }
}

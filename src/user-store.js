import {
  difference,
  forEach,
  keys,
  length,
  map,
  pick,
  prop,
  values,
} from "ramda"

import { appendQueryParamsAsArray } from "./utils"
import { Store } from "./store"
import { parseBasicUser } from "./parsers"
import { User } from "./user"

export class UserStore {
  constructor({ instance, presenceStore, logger }) {
    this.instance = instance
    this.presenceStore = presenceStore
    this.logger = logger
    this.reqs = {} // ongoing requests by userId
    this.onSetHooks = [] // hooks called when a new user is added to the store
    this.store = new Store()

    this.initialize = this.initialize.bind(this)
    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.fetchUser = this.fetchUser.bind(this)
    this.fetchMissingUsers = this.fetchMissingUsers.bind(this)
    this.fetchBasicUsers = this.fetchBasicUsers.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.getSync = this.getSync.bind(this)
    this.decorate = this.decorate.bind(this)
  }

  initialize(initial) {
    this.store.initialize(map(this.decorate, initial))
  }

  set(userId, basicUser) {
    return this.store
      .set(userId, this.decorate(basicUser))
      .then(() => forEach(hook => hook(userId), this.onSetHooks))
  }

  get(userId) {
    return Promise.all([
      this.fetchUser(userId),
      this.presenceStore.get(userId), // Make sure it's safe to getSync
    ]).then(([user]) => user)
  }

  fetchUser(userId) {
    return this.fetchMissingUsers([userId]).then(() => this.store.get(userId))
  }

  fetchMissingUsers(userIds) {
    const missing = difference(
      userIds,
      map(prop("id"), values(this.store.snapshot())),
    )
    const missingNotInProgress = difference(missing, keys(this.reqs))
    if (length(missingNotInProgress) > 0) {
      this.fetchBasicUsers(missingNotInProgress)
    }
    return Promise.all(values(pick(userIds, this.reqs)))
  }

  fetchBasicUsers(userIds) {
    const req = this.instance
      .request({
        method: "GET",
        path: appendQueryParamsAsArray("id", userIds, "/users_by_ids"),
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
        this.logger.warn("error fetching missing users:", err)
        throw err
      })
    forEach(userId => {
      this.reqs[userId] = req
    }, userIds)
  }

  snapshot(...x) {
    return this.store.snapshot(...x)
  }

  getSync(...x) {
    return this.store.getSync(...x)
  }

  decorate(basicUser) {
    return basicUser ? new User(basicUser, this.presenceStore) : undefined
  }
}

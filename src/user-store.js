import { difference } from "ramda"

import { appendQueryParamsAsArray } from "./utils"
import { parseBasicUser } from "./parsers"
import { User } from "./user"

export class UserStore {
  constructor({ instance, presenceStore, logger }) {
    this.instance = instance
    this.presenceStore = presenceStore
    this.logger = logger
    this.reqs = {} // ongoing requests by userId
    this.onSetHooks = [] // hooks called when a new user is added to the store
    this.users = {}

    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.fetchMissingUsers = this.fetchMissingUsers.bind(this)
    this.fetchBasicUsers = this.fetchBasicUsers.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.getSync = this.getSync.bind(this)
    this.decorate = this.decorate.bind(this)
  }

  set(basicUser) {
    this.users[basicUser.id] = this.decorate(basicUser)
    this.onSetHooks.forEach(hook => hook(basicUser.id))
    return Promise.resolve(this.users[basicUser.id])
  }

  get(userId) {
    return this.fetchMissingUsers([userId]).then(() => this.users[userId])
  }

  fetchMissingUsers(userIds) {
    const missing = difference(
      userIds,
      Object.values(this.users).map(u => u.id),
    )
    const missingNotInProgress = difference(missing, Object.keys(this.reqs))
    if (missingNotInProgress.length > 0) {
      this.fetchBasicUsers(missingNotInProgress)
    }
    return Promise.all(userIds.map(userId => this.reqs[userId]))
  }

  fetchBasicUsers(userIds) {
    const req = this.instance
      .request({
        method: "GET",
        path: appendQueryParamsAsArray("id", userIds, "/users_by_ids"),
      })
      .then(res => {
        const basicUsers = JSON.parse(res).map(u => parseBasicUser(u))
        basicUsers.forEach(user => this.set(user))
        userIds.forEach(userId => {
          delete this.reqs[userId]
        })
      })
      .catch(err => {
        this.logger.warn("error fetching missing users:", err)
        throw err
      })
    userIds.forEach(userId => {
      this.reqs[userId] = req
    })
  }

  snapshot() {
    return this.users
  }

  getSync(userId) {
    return this.users[userId]
  }

  decorate(basicUser) {
    return basicUser ? new User(basicUser, this.presenceStore) : undefined
  }
}

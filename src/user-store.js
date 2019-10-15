import { appendQueryParamsAsArray } from "./utils"
import { parseBasicUser } from "./parsers"
import { User } from "./user"
import { MISSING_USER_WAIT } from "./constants"

export class UserStore {
  constructor({ instance, presenceStore, logger }) {
    this.instance = instance
    this.presenceStore = presenceStore
    this.logger = logger
    this.missingUserCallbackBuffer = {}
    this.onSetHooks = [] // hooks called when a new user is added to the store
    this.users = {}

    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.fetchMissingUser = this.fetchMissingUser.bind(this)
    this.fetchMissingUsers = this.fetchMissingUsers.bind(this)
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
    return this.fetchMissingUser(userId).then(() => this.users[userId])
  }

  fetchMissingUsers(userIds) {
    return Promise.all(userIds.map(userId => this.fetchMissingUser(userId)))
  }

  fetchMissingUser(userId) {
    return new Promise((resolve, reject) => {
      if (this.users[userId]) {
        resolve()
        return
      }
      if (!this.missingUserTimer) {
        this.missingUserTimer = setTimeout(() => {
          this.fetchMissingUserReq().then(() => {
            delete this.missingUserTimer
          })
        }, MISSING_USER_WAIT)
      }

      if (this.missingUserCallbackBuffer[userId]) {
        this.missingUserCallbackBuffer[userId].push({ resolve, reject })
      } else {
        this.missingUserCallbackBuffer[userId] = [{ resolve, reject }]
      }
    })
  }

  fetchMissingUserReq() {
    // Take a snapshot of the users we're getting since the buffer may change
    // before the below promise returns.
    const userIds = Object.keys(this.missingUserCallbackBuffer)

    if (userIds.length === 0) {
      return Promise.resolve()
    }

    return this.instance
      .request({
        method: "GET",
        path: appendQueryParamsAsArray("id", userIds, "/users_by_ids"),
      })
      .then(res => {
        const basicUsers = JSON.parse(res).map(u => parseBasicUser(u))
        basicUsers.forEach(user => {
          this.set(user)
          this.missingUserCallbackBuffer[user.id].forEach(({ resolve }) =>
            resolve(),
          )
          delete this.missingUserCallbackBuffer[user.id]
        })
      })
      .catch(err => {
        this.logger.warn("error fetching missing users:", err)
        userIds.forEach(userId => {
          this.missingUserCallbackBuffer[userId].forEach(({ reject }) =>
            reject(err),
          )
          delete this.missingUserCallbackBuffer[userId]
        })
        throw err
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

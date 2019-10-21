import { appendQueryParamsAsArray } from "./utils"
import { parseBasicUser } from "./parsers"
import { User } from "./user"
import { batch } from "./batch"
import { MISSING_USER_WAIT, MAX_FETCH_USER_BATCH } from "./constants"

export class UserStore {
  constructor({ instance, presenceStore, logger }) {
    this.instance = instance
    this.presenceStore = presenceStore
    this.logger = logger
    this.onSetHooks = [] // hooks called when a new user is added to the store
    this.users = {}

    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.fetchMissingUser = batch(
      this._fetchMissingUserBatch.bind(this),
      MISSING_USER_WAIT,
      MAX_FETCH_USER_BATCH,
    )
    this.fetchMissingUsers = this.fetchMissingUsers.bind(this)
    this.fetchMissingUserReq = this.fetchMissingUserReq.bind(this)
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

  _fetchMissingUserBatch(args) {
    const userIds = args.filter(userId => !this.users[userId])
    if (userIds.length > 0) {
      return this.fetchMissingUserReq(userIds)
    } else {
      return Promise.resolve()
    }
  }

  fetchMissingUserReq(userIds) {
    return this.instance
      .request({
        method: "GET",
        path: appendQueryParamsAsArray("id", userIds, "/users_by_ids"),
      })
      .then(res => {
        const basicUsers = JSON.parse(res).map(u => parseBasicUser(u))
        basicUsers.forEach(user => {
          this.set(user)
        })
      })
      .catch(err => {
        this.logger.warn("error fetching missing users:", err)
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

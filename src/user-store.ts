import { difference } from "ramda"

import { appendQueryParamsAsArray } from "./utils"
import { parseBasicUser } from "./parsers"
import { User, PresenceStore, BasicUser } from "./user"
import { Instance, Logger } from "@pusher/platform";

export class UserStore {
  private instance: Instance;
  private presenceStore: PresenceStore;
  private logger: Logger;
  private reqs: { [userId: string]: Promise<void> }
  public onSetHooks: ((userId: string) => void)[];
  private users: { [userId: string]: User };

  public constructor(options: {
    instance: Instance;
    presenceStore: PresenceStore;
    logger: Logger;
  }) {
    this.instance = options.instance
    this.presenceStore = options.presenceStore
    this.logger = options.logger
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

  public set(basicUser: BasicUser) {
    this.users[basicUser.id] = this.decorate(basicUser)
    this.onSetHooks.forEach(hook => hook(basicUser.id))
    return Promise.resolve(this.users[basicUser.id])
  }

  public get(userId: string) {
    return this.fetchMissingUsers([userId]).then(() => this.users[userId])
  }

  public fetchMissingUsers(userIds: string[]) {
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

  public fetchBasicUsers(userIds: string[]) {
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

  public snapshot() {
    return this.users
  }

  public getSync(userId: string) {
    return this.users[userId]
  }

  private decorate(basicUser: BasicUser): User {
    return basicUser ? new User(basicUser, this.presenceStore) : undefined
  }
}

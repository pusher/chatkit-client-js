import { BaseClient, HOST_BASE, Instance } from "@pusher/platform"
import { split } from "ramda"

import { CurrentUser } from "./current-user"
import { typeCheck, typeCheckObj } from "./utils"
import { DEFAULT_CONNECTION_TIMEOUT } from "./constants"

import { version } from "../package.json"

export class ChatManager {
  constructor({ instanceLocator, tokenProvider, userId, ...options } = {}) {
    typeCheck("instanceLocator", "string", instanceLocator)
    typeCheck("tokenProvider", "object", tokenProvider)
    typeCheck("tokenProvider.fetchToken", "function", tokenProvider.fetchToken)
    typeCheck("userId", "string", userId)
    const cluster = split(":", instanceLocator)[1]
    if (cluster === undefined) {
      throw new TypeError(
        `expected instanceLocator to be of the format x:y:z, but was ${instanceLocator}`,
      )
    }
    const baseClient =
      options.baseClient ||
      new BaseClient({
        host: `${cluster}.${HOST_BASE}`,
        logger: options.logger,
        sdkProduct: "chatkit",
        sdkVersion: version,
      })
    if (typeof tokenProvider.setUserId === "function") {
      tokenProvider.setUserId(userId)
    }
    const instanceOptions = {
      client: baseClient,
      locator: instanceLocator,
      logger: options.logger,
      tokenProvider,
    }
    this.serverInstanceV2 = new Instance({
      serviceName: "chatkit",
      serviceVersion: "v2",
      ...instanceOptions,
    })
    this.serverInstanceV3 = new Instance({
      serviceName: "chatkit",
      serviceVersion: "v3",
      ...instanceOptions,
    })
    this.filesInstance = new Instance({
      serviceName: "chatkit_files",
      serviceVersion: "v1",
      ...instanceOptions,
    })
    this.cursorsInstance = new Instance({
      serviceName: "chatkit_cursors",
      serviceVersion: "v2",
      ...instanceOptions,
    })
    this.presenceInstance = new Instance({
      serviceName: "chatkit_presence",
      serviceVersion: "v2",
      ...instanceOptions,
    })
    this.userId = userId
    this.connectionTimeout =
      options.connectionTimeout || DEFAULT_CONNECTION_TIMEOUT

    this.connect = this.connect.bind(this)
    this.disconnect = this.disconnect.bind(this)
  }

  connect(hooks = {}) {
    typeCheckObj("hooks", "function", hooks)
    const currentUser = new CurrentUser({
      hooks,
      id: this.userId,
      serverInstanceV2: this.serverInstanceV2,
      serverInstanceV3: this.serverInstanceV3,
      filesInstance: this.filesInstance,
      cursorsInstance: this.cursorsInstance,
      presenceInstance: this.presenceInstance,
      connectionTimeout: this.connectionTimeout,
    })
    return Promise.all([
      currentUser.establishUserSubscription(),
      currentUser.establishCursorSubscription(),
      currentUser.establishPresenceSubscription(),
    ]).then(() => {
      this.currentUser = currentUser
      return currentUser
    })
  }

  disconnect() {
    if (this.currentUser) this.currentUser.disconnect()
  }
}

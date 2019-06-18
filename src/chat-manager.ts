import { BaseClient, HOST_BASE, Instance, Logger } from "@pusher/platform"
import { split } from "ramda"

import { CurrentUser } from "./current-user"
import { TokenProvider } from './token-provider'
import { DEFAULT_CONNECTION_TIMEOUT } from "./constants"

import { version } from "../package.json"

export class ChatManager {

  public userId: string;
  public connectionTimeout: number;
  public currentUser?: CurrentUser;

  public serverInstanceV2: Instance;
  public serverInstanceV4: Instance;
  public filesInstance: Instance;
  public cursorsInstance: Instance;
  public presenceInstance: Instance;

  public constructor({instanceLocator, tokenProvider, userId, baseClient, logger, connectionTimeout}: { 
    instanceLocator: string,
    tokenProvider: TokenProvider,
    userId: string,
    baseClient?: BaseClient,
    logger?: Logger,
    connectionTimeout?: number,
  }) {
    const cluster = split(":", instanceLocator)[1]
    if (cluster === undefined) {
      throw new TypeError(
        `expected instanceLocator to be of the format x:y:z, but was ${instanceLocator}`,
      )
    }
    baseClient =
      baseClient ||
      new BaseClient({
        host: `${cluster}.${HOST_BASE}`,
        logger: logger,
        sdkProduct: "chatkit",
        sdkVersion: version,
      })
    if (tokenProvider.setUserId) {
      tokenProvider.setUserId(userId);
    }
    const instanceOptions = {
      client: baseClient,
      locator: instanceLocator,
      logger: logger,
      tokenProvider: tokenProvider,
    }
    this.serverInstanceV2 = new Instance({
      serviceName: "chatkit",
      serviceVersion: "v2",
      ...instanceOptions,
    })
    this.serverInstanceV4 = new Instance({
      serviceName: "chatkit",
      serviceVersion: "v4",
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
      connectionTimeout || DEFAULT_CONNECTION_TIMEOUT

    this.connect = this.connect.bind(this)
    this.disconnect = this.disconnect.bind(this)
  }

  public connect(hooks = {}) {
    const currentUser = new CurrentUser({
      hooks,
      id: this.userId,
      serverInstanceV2: this.serverInstanceV2,
      serverInstanceV4: this.serverInstanceV4,
      filesInstance: this.filesInstance,
      cursorsInstance: this.cursorsInstance,
      presenceInstance: this.presenceInstance,
      connectionTimeout: this.connectionTimeout,
    })
    return Promise.all([
      currentUser.establishUserSubscription(),
      currentUser.establishPresenceSubscription(),
    ]).then(() => {
      this.currentUser = currentUser
      return currentUser
    })
  }

  public disconnect() {
    if (this.currentUser) this.currentUser.disconnect()
  }
}

import { Logger, Instance, Subscription } from "@pusher/platform";

export class PresenceSubscription {
  private userId: string;
  private instance: Instance;
  private logger: Logger;
  private connectionTimeout: number;

  private timeout?: NodeJS.Timeout;
  private sub?: Subscription;

  public constructor(options: {
    userId: string;
    instance: Instance;
    logger: Logger;
    connectionTimeout: number;
  }) {
    this.userId = options.userId
    this.instance = options.instance
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("presence subscription timed out"))
      }, this.connectionTimeout)
      this.sub = this.instance.subscribeNonResuming({
        path: `/users/${encodeURIComponent(this.userId)}/register`,
        listeners: {
          onOpen: () => {
            this.timeout && clearTimeout(this.timeout)
            resolve()
          },
          onError: err => {
            this.timeout && clearTimeout(this.timeout)
            reject(err)
          },
        },
      })
    })
  }

  public cancel() {
    this.timeout && clearTimeout(this.timeout)
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug("error when cancelling presence subscription", err)
    }
  }
}

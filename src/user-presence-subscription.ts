import { contains, compose, forEach, filter, toPairs } from "ramda"

import { parsePresence } from "./parsers"
import { UserStore } from "./user-store";
import { RoomStore } from "./room-store";
import { Presence, User, PresenceStore } from "./user";
import { Logger, Subscription, Instance } from "@pusher/platform";
import { Room } from "./room";

export class UserPresenceSubscription {
  private userId: string;
  private hooks: {
    global: {
      onPresenceChanged?: (state: { current: Presence, previous: Presence }, user: User) => void;
    };
    rooms: {
      [roomId: string]: {
        onPresenceChanged?: (state: { current: Presence, previous: Presence }, user: User) => void;
      }
    }
  }
  private instance: Instance;
  private userStore: UserStore;
  private roomStore: RoomStore;
  private presenceStore: PresenceStore;
  private logger: Logger;
  private connectionTimeout: number;
  private timeout: NodeJS.Timeout;
  private onSubscriptionEstablished: () => void;
  private sub: Subscription;

  public constructor(options: {
    userId: string;
    hooks: UserPresenceSubscription["hooks"];
    instance: Instance;
    userStore: UserStore;
    roomStore: RoomStore;
    presenceStore: PresenceStore;
    logger: Logger;
    connectionTimeout: number;
  }) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.presenceStore = options.presenceStore
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout

    this.connect = this.connect.bind(this)
    this.cancel = this.cancel.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.onPresenceState = this.onPresenceState.bind(this)
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("user presence subscription timed out"))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = () => {
        clearTimeout(this.timeout)
        resolve()
      }
      this.sub = this.instance.subscribeNonResuming({
        path: `/users/${encodeURIComponent(this.userId)}`,
        listeners: {
          onError: err => {
            clearTimeout(this.timeout)
            reject(err)
          },
          onEvent: this.onEvent,
        },
      })
    })
  }

  public cancel() {
    clearTimeout(this.timeout)
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug("error when cancelling user presence subscription", err)
    }
  }

  private onEvent(body: any) {
    switch (body.event_name) {
      case "presence_state":
        this.onPresenceState(body.data)
        break
    }
  }

  private onPresenceState(data: any) {
    this.onSubscriptionEstablished()
    const previous = this.presenceStore[this.userId] || "unknown"
    const current = parsePresence(data).state
    if (current === previous) {
      return
    }
    this.presenceStore[this.userId] = current
    this.userStore.get(this.userId).then(user => {
      if (this.hooks.global.onPresenceChanged) {
        this.hooks.global.onPresenceChanged({ current, previous }, user)
      }
      compose(
        forEach(([roomId, hooks]) =>
          this.roomStore.get(roomId).then((room: Room) => {
            if (contains(user.id, room.userIds)) {
              hooks.onPresenceChanged({ current, previous }, user)
            }
          }),
        ),
        filter<any>(pair => pair[1].onPresenceChanged !== undefined),
        toPairs,
      )(this.hooks.rooms)
    })
  }
}

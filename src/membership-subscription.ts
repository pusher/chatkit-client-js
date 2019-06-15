import { handleMembershipSubReconnection } from "./reconnection-handlers"
import { UserStore } from "./user-store";
import { RoomStore } from "./room-store";
import { Instance, Logger, Subscription } from "@pusher/platform";
import { Room } from "./room";
import { User } from "./user";

export class MembershipSubscription {
  private roomId: string;
  private userStore: UserStore;
  private roomStore: RoomStore;
  private instance: Instance;
  private logger: Logger;
  private connectionTimeout: number;
  private onUserJoinedRoomHook: (room: Room, user: User) => void;
  private onUserLeftRoomHook: (room: Room, user: User) => void;
  private timeout: NodeJS.Timeout;
  public established: boolean;
  private sub: Subscription;
  private onSubscriptionEstablished: () => void;

  public constructor(options: {
    roomId: string;
    instance: Instance;
    userStore: UserStore;
    roomStore: RoomStore;
    logger: Logger;
    connectionTimeout: number;
    onUserJoinedRoomHook: (room: Room, user: User) => void;
    onUserLeftRoomHook: (room: Room, user: User) => void;
  }) {
    this.roomId = options.roomId
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout
    this.onUserJoinedRoomHook = options.onUserJoinedRoomHook
    this.onUserLeftRoomHook = options.onUserLeftRoomHook

    this.connect = this.connect.bind(this)
    this.cancel = this.cancel.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.onInitialState = this.onInitialState.bind(this)
    this.onUserJoined = this.onUserJoined.bind(this)
    this.onUserLeft = this.onUserLeft.bind(this)
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("membership subscription timed out"))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = () => {
        clearTimeout(this.timeout)
        resolve()
      }
      this.sub = this.instance.subscribeNonResuming({
        path: `/rooms/${encodeURIComponent(this.roomId)}/memberships`,
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
      this.logger.debug("error when cancelling membership subscription", err)
    }
  }

  private onEvent(body: any) {
    switch (body.event_name) {
      case "initial_state":
        this.onInitialState(body.data)
        break
      case "user_joined":
        this.onUserJoined(body.data)
        break
      case "user_left":
        this.onUserLeft(body.data)
        break
    }
  }

  private onInitialState(userIds: string[]) {
    if (!this.established) {
      this.established = true
      this.roomStore.update(this.roomId, { userIds }).then(() => {
        this.onSubscriptionEstablished()
      })
    } else {
      handleMembershipSubReconnection({
        userIds,
        roomId: this.roomId,
        roomStore: this.roomStore,
        userStore: this.userStore,
        onUserJoinedRoomHook: this.onUserJoinedRoomHook,
        onUserLeftRoomHook: this.onUserLeftRoomHook,
      })
    }
  }

  private onUserJoined(userId: string) {
    this.roomStore
      .addUserToRoom(this.roomId, userId)
      .then(room =>
        this.userStore
          .get(userId)
          .then(user => this.onUserJoinedRoomHook(room, user)),
      )
  }

  private onUserLeft(userId: string) {
    this.roomStore
      .removeUserFromRoom(this.roomId, userId)
      .then(room =>
        this.userStore
          .get(userId)
          .then(user => this.onUserLeftRoomHook(room, user)),
      )
  }
}

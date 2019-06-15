import { parseBasicRoom, parseBasicUser, parseBasicCursor } from "./parsers"
import { handleUserSubReconnection } from "./reconnection-handlers"
import { Instance, Logger, Subscription } from "@pusher/platform";
import { RoomStore } from "./room-store";
import { CursorStore } from "./cursor-store";
import { RoomSubscription } from "./room-subscription";
import { CurrentUser } from "./current-user";
import { Room, BasicRoom } from "./room";
import { Cursor, BasicCursor } from "./cursor";
import { BasicUser } from "./user";

export class UserSubscription {
  private userId: string;
  private hooks: {
    global: {
      onAddedToRoom?: (room: Room) => void;
      onRemovedFromRoom?: (room: Room) => void;
      onRoomUpdated?: (room: Room) => void;
      onRoomDeleted?: (room: Room) => void;
      onNewReadCursor?: (cursor: Cursor) => void;
    }
  };
  private instance: Instance;
  private roomStore: RoomStore;
  private cursorStore: CursorStore;
  private roomSubscriptions: RoomSubscription[];
  private logger: Logger;
  private connectionTimeout: number;
  private currentUser: CurrentUser;

  private timeout: NodeJS.Timeout;
  private onSubscriptionEstablished: (
    basicUser: BasicUser,
    basicRooms: BasicRoom[],
    basicCursors: BasicCursor[]
    ) => void;
  private established: boolean;
  private sub: Subscription;

  constructor(options: {
    userId: string;
    hooks: UserSubscription["hooks"];
    instance: Instance;
    roomStore: RoomStore;
    cursorStore: CursorStore;
    roomSubscriptions: RoomSubscription[];
    logger: Logger;
    connectionTimeout: number;
    currentUser: CurrentUser;
  }) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.roomStore = options.roomStore
    this.cursorStore = options.cursorStore
    this.roomSubscriptions = options.roomSubscriptions
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout
    this.currentUser = options.currentUser

    this.connect = this.connect.bind(this)
    this.cancel = this.cancel.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.onInitialState = this.onInitialState.bind(this)
    this.onAddedToRoom = this.onAddedToRoom.bind(this)
    this.onRemovedFromRoom = this.onRemovedFromRoom.bind(this)
    this.onRoomUpdated = this.onRoomUpdated.bind(this)
    this.onRoomDeleted = this.onRoomDeleted.bind(this)
  }

  public connect(): Promise<{
    user: BasicUser,
    rooms: BasicRoom[],
    cursors: BasicCursor[]
  }> {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("user subscription timed out"))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = (basicUser, basicRooms, basicCursors) => {
        clearTimeout(this.timeout)
        resolve({
          user: basicUser,
          rooms: basicRooms,
          cursors: basicCursors
        })
      }
      this.sub = this.instance.subscribeNonResuming({
        path: "/users",
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
      this.logger.debug("error when cancelling user subscription", err)
    }
  }

  private onEvent({ body }) {
    switch (body.event_name) {
      case "initial_state":
        this.onInitialState(body.data)
        break
      case "added_to_room":
        this.onAddedToRoom(body.data)
        break
      case "removed_from_room":
        this.onRemovedFromRoom(body.data)
        break
      case "room_updated":
        this.onRoomUpdated(body.data)
        break
      case "room_deleted":
        this.onRoomDeleted(body.data)
        break
      case "new_cursor":
        this.onNewCursor(body.data)
        break
    }
  }

  private onInitialState({
    current_user: userData,
    rooms: roomsData,
    cursors: cursorsData,
  }) {
    const basicUser = parseBasicUser(userData)
    const basicRooms = roomsData.map(d => parseBasicRoom(d))
    const basicCursors = cursorsData.map(d => parseBasicCursor(d))
    if (!this.established) {
      this.established = true
      this.onSubscriptionEstablished(basicUser, basicRooms, basicCursors)
    } else {
      handleUserSubReconnection({
        basicUser,
        basicRooms,
        basicCursors,
        currentUser: this.currentUser,
        roomStore: this.roomStore,
        cursorStore: this.cursorStore,
        hooks: this.hooks,
      })
    }
  }

  private onAddedToRoom({ room: roomData }) {
    this.roomStore.set(parseBasicRoom(roomData)).then(room => {
      if (this.hooks.global.onAddedToRoom) {
        this.hooks.global.onAddedToRoom(room)
      }
    })
  }

  private onRemovedFromRoom({ room_id: roomId }) {
    this.roomStore.pop(roomId).then(room => {
      if (room && this.hooks.global.onRemovedFromRoom) {
        this.hooks.global.onRemovedFromRoom(room)
      }
    })
  }

  private onRoomUpdated({ room: roomData }) {
    const updates = parseBasicRoom(roomData)
    this.roomStore.update(updates.id, updates).then(room => {
      if (this.hooks.global.onRoomUpdated) {
        this.hooks.global.onRoomUpdated(room)
      }
    })
  }

  private onRoomDeleted({ room_id: roomId }) {
    this.roomStore.pop(roomId).then(room => {
      if (room && this.hooks.global.onRoomDeleted) {
        this.hooks.global.onRoomDeleted(room)
      }
    })
  }

  private onNewCursor(data) {
    return this.cursorStore.set(parseBasicCursor(data)).then(cursor => {
      if (this.hooks.global.onNewReadCursor && cursor.type === 0) {
        this.hooks.global.onNewReadCursor(cursor)
      }
    })
  }
}

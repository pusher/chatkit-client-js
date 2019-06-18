import { parseBasicRoom, parseBasicUser, parseBasicCursor } from "./parsers"
import { handleUserSubReconnection } from "./reconnection-handlers"
import { Instance, Logger, Subscription } from "@pusher/platform";
import { RoomStore } from "./room-store";
import { CursorStore } from "./cursor-store";
import { CurrentUser } from "./current-user";
import { Room, BasicRoom } from "./room";
import { Cursor, BasicCursor } from "./cursor";
import { BasicUser } from "./user";
import { TypingIndicators } from "./typing-indicators";

export class UserSubscription {
  private userId: string;
  private hooks: {
    global: {
      onAddedToRoom?: (room: BasicRoom) => void;
      onRemovedFromRoom?: (room: BasicRoom) => void;
      onRoomUpdated?: (room: BasicRoom) => void;
      onRoomDeleted?: (room: BasicRoom) => void;
      onNewReadCursor?: (cursor: BasicCursor) => void;
    }
  };
  private readonly instance: Instance;
  private readonly roomStore: RoomStore;
  private readonly cursorStore: CursorStore;
  private readonly typingIndicators: TypingIndicators;
  private readonly logger: Logger;
  private readonly connectionTimeout: number;
  private readonly currentUser: CurrentUser;

  private timeout?: NodeJS.Timeout;
  private onSubscriptionEstablished?: ({basicUser, basicRooms, basicCursors}: {
    basicUser: BasicUser,
    basicRooms: BasicRoom[],
    basicCursors: BasicCursor[]
    }) => void;
  private established: boolean = false;
  private sub?: Subscription;

  constructor(options: {
    userId: string;
    hooks: UserSubscription["hooks"];
    instance: Instance;
    roomStore: RoomStore;
    cursorStore: CursorStore;
    typingIndicators: TypingIndicators,
    logger: Logger;
    connectionTimeout: number;
    currentUser: CurrentUser;
  }) {
    this.userId = options.userId
    this.hooks = options.hooks
    this.instance = options.instance
    this.roomStore = options.roomStore
    this.cursorStore = options.cursorStore
    this.typingIndicators = options.typingIndicators
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
    basicUser: BasicUser,
    basicRooms: BasicRoom[],
    basicCursors: BasicCursor[]
  }> {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("user subscription timed out"))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = (initialState: {basicUser: BasicUser, basicRooms : BasicRoom[], basicCursors: BasicCursor[]}) => {
        this.timeout && clearTimeout(this.timeout)
        resolve(initialState)
      }
      this.sub = this.instance.subscribeNonResuming({
        path: "/users",
        listeners: {
          onError: err => {
            this.timeout && clearTimeout(this.timeout)
            reject(err)
          },
          onEvent: this.onEvent,
        },
      })
    })
  }

  public cancel() {
    this.timeout && clearTimeout(this.timeout)
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug("error when cancelling user subscription", err)
    }
  }

  private onEvent(body: any) {
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

  private onInitialState(data: {
    current_user: any,
    rooms: any,
    cursors: any,
  }) {
    const basicUser = parseBasicUser(data.current_user)
    const basicRooms = data.rooms.map((d: any) => parseBasicRoom(d))
    const basicCursors = data.cursors.map((d: any) => parseBasicCursor(d))
    if (!this.established) {
      this.established = true
      this.onSubscriptionEstablished && this.onSubscriptionEstablished({basicUser, basicRooms, basicCursors})
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

  private onAddedToRoom({ room: roomData }: {room: any}) {
    this.roomStore.set(parseBasicRoom(roomData)).then(room => {
      if (this.hooks.global.onAddedToRoom) {
        this.hooks.global.onAddedToRoom(room)
      }
    })
  }

  private onRemovedFromRoom({room_id: roomId}: {room_id: string}) {
    this.roomStore.pop(roomId).then(room => {
      if (room && this.hooks.global.onRemovedFromRoom) {
        this.hooks.global.onRemovedFromRoom(room)
      }
    })
  }

  private onRoomUpdated({ room: roomData }: {room: any}) {
    const updates = parseBasicRoom(roomData)
    this.roomStore.update(updates.id, updates).then(room => {
      if (this.hooks.global.onRoomUpdated) {
        this.hooks.global.onRoomUpdated(room)
      }
    })
  }

  private onRoomDeleted({room_id: roomId}: {room_id: string}) {
    this.roomStore.pop(roomId).then(room => {
      if (room && this.hooks.global.onRoomDeleted) {
        this.hooks.global.onRoomDeleted(room)
      }
    })
  }

  private onNewCursor(data: any) {
    return this.cursorStore.set(parseBasicCursor(data)).then(cursor => {
      if (this.hooks.global.onNewReadCursor && cursor.type === 0) {
        this.hooks.global.onNewReadCursor(cursor)
      }
    })
  }
}

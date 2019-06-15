import { UserStore } from "./user-store";
import { RoomStore } from "./room-store";

export interface BasicCursor {
  position: number;
  updatedAt: string;
  userId: string;
  roomId: string;
  type: 0;
}

export class Cursor implements BasicCursor {
  public position: number;
  public updatedAt: string;
  public userId: string;
  public roomId: string;
  public type: 0;

  public userStore: UserStore;
  public roomStore: RoomStore;

  constructor(basicCursor: BasicCursor, userStore: UserStore, roomStore: RoomStore) {
    this.position = basicCursor.position
    this.updatedAt = basicCursor.updatedAt
    this.userId = basicCursor.userId
    this.roomId = basicCursor.roomId
    this.type = basicCursor.type
    this.userStore = userStore
    this.roomStore = roomStore
  }

  get user() {
    return this.userStore.getSync(this.userId)
  }

  get room() {
    return this.roomStore.getSync(this.roomId)
  }
}

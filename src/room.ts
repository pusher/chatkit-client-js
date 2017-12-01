import CursorSubscription from './cursor_subscription';
import RoomSubscription from './room_subscription';
import RoomUserStore from './room_user_store';

export interface RoomOptions {
  id: number;
  name: string;
  isPrivate: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  userIds?: string[];
}

export default class Room {
  id: number;
  name: string;
  isPrivate: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  userIds: string[];

  userStore: RoomUserStore;
  subscription?: RoomSubscription;
  cursorSubscription?: CursorSubscription;

  constructor(options: RoomOptions) {
    this.id = options.id;
    this.name = options.name;
    this.isPrivate = options.isPrivate;
    this.createdByUserId = options.createdByUserId;
    this.createdAt = options.createdAt;
    this.updatedAt = options.updatedAt;
    this.deletedAt = options.deletedAt;
    this.userIds = options.userIds || [];
    this.userStore = new RoomUserStore();
  }

  updateWithPropertiesOfRoom(room: Room) {
    this.name = room.name;
    this.isPrivate = room.isPrivate;
    this.updatedAt = room.updatedAt;
    this.deletedAt = room.deletedAt;
    this.userIds = room.userIds;
  }
}

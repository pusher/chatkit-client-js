import {
  Instance
} from 'pusher-platform';

import GlobalUserStore from './global_user_store';
import RoomStore from './room_store';
import Room from './room';

export interface CurrentUserOptions {
    id: string;
    createdAt: string;
    updatedAt: string;
    name?: string;
    avatarURL?: string;
    customData?: any; // TODO: Shouldn't be any (type)
    rooms?: Room[];
    instance: Instance;
    userStore: GlobalUserStore;
}

export default class CurrentUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  avatarURL?: string;
  customData?: any;
  userStore: GlobalUserStore;
  roomStore: RoomStore;
  instance: Instance;
  pathFriendlyId: string;

  constructor(options: CurrentUserOptions) {
    const { rooms, id, instance } = options;
    const validRooms: Room[] = rooms || [];

    this.id = id;
    this.createdAt = options.createdAt;
    this.updatedAt = options.updatedAt;
    this.name = options.name;
    this.avatarURL = options.avatarURL;
    this.customData = options.customData;
    this.roomStore = new RoomStore({ instance, rooms: validRooms });
    this.instance = instance;
    this.userStore = options.userStore;
    this.pathFriendlyId = encodeURIComponent(id); // TODO: This is different to Swift SDK
  }

  updateWithPropertiesOf(currentUser: CurrentUser) {
    this.updatedAt = currentUser.updatedAt;
    this.name = currentUser.name;
    this.customData = currentUser.customData;
  }
}

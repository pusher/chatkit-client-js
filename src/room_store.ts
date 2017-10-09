import {
  Instance
} from 'pusher-platform';

import Room from './room';

export interface RoomStoreOptions {
  rooms: Room[];
  instance: Instance;
}

export default class RoomStore {
  rooms: Room[];
  instance: Instance;

  constructor(options: RoomStoreOptions) {
    this.rooms = options.rooms;
    this.instance = options.instance;
  }

  addOrMerge(room: Room, callback: (Room) => void) {

  }

  remove(id: number, onSuccess: () => void, onError: () => void) {

  }
}

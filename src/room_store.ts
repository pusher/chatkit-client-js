import {
  Instance
} from 'pusher-platform';

import Room from './room';
import PayloadDeserializer from './payload_deserializer';

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

  addOrMerge(room: Room): Room {
    const existingRoom = this.rooms.find(el => el.id === room.id);

    if (existingRoom) {
      existingRoom.updateWithPropertiesOfRoom(room);
      return existingRoom;
    } else {
      this.rooms.push(room);
      return room;
    }
  }

  remove(id: number): Room | undefined {
    const indexOfRoom = this.rooms.findIndex(el => el.id === id);
    if (indexOfRoom === -1) {
      return undefined;
    }

    const room = this.rooms[indexOfRoom];
    this.rooms.splice(indexOfRoom, 1);
    return room;
  }

  findOrGetRoom(id: number, onSuccess: (room: Room) => void, onError: (error: Error) => void) {
    const room = this.rooms.find(el => { el.id === id });
    if (room) {
      onSuccess(room);
    } else {
      this.getRoom(id, onSuccess, onError);
    }
  }

  getRoom(id: number, onSuccess: (room: Room) => void, onError: (error: Error) => void) {
    this.instance.request({
      method: "GET",
      path: `/rooms/${id}`,
    }).then(res => {
      const roomPayload = JSON.parse(res);

      const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
      onSuccess(room);
    }).catch(err => {
      // TODO: Proper error handling
      onError(err);
      console.log("Error", err)
    })
  }
}

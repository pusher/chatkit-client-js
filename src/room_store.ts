import { Instance } from 'pusher-platform';

import PayloadDeserializer from './payload_deserializer';
import Room from './room';

export interface RoomStoreOptions {
  rooms: Room[];
  apiInstance: Instance;
}

export default class RoomStore {
  rooms: Room[];
  apiInstance: Instance;

  constructor(options: RoomStoreOptions) {
    this.rooms = options.rooms;
    this.apiInstance = options.apiInstance;
  }

  room(
    id: number,
    onSuccess: (room: Room) => void,
    onError: (error: Error) => void,
  ) {
    this.findOrGetRoom(id, onSuccess, onError);
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

  findOrGetRoom(
    id: number,
    onSuccess: (room: Room) => void,
    onError: (error: Error) => void,
  ) {
    const room = this.rooms.find(el => el.id === id);
    if (room) {
      onSuccess(room);
    } else {
      this.getRoom(id, onSuccess, onError);
    }
  }

  getRoom(
    id: number,
    onSuccess: (room: Room) => void,
    onError: (error: Error) => void,
  ) {
    this.apiInstance
      .request({
        method: 'GET',
        path: `/rooms/${id}`,
      })
      .then((res: any) => {
        const roomPayload = JSON.parse(res);
        const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
        onSuccess(room);
      })
      .catch((error: any) => {
        this.apiInstance.logger.debug(`Error fetching room ${id}:`, error);
        onError(error);
      });
  }
}

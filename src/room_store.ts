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

  async room(id: number): Promise<Room> {
    const room = this.rooms.find(el => el.id === id);
    if (room) {
      return room;
    }
    return this.getRoom(id);
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

  async getRoom(id: number): Promise<Room> {
    try {
      const res = await this.apiInstance.request({
        method: 'GET',
        path: `/rooms/${id}`,
      });
      const roomPayload = JSON.parse(res);
      return PayloadDeserializer.createRoomFromPayload(roomPayload);
    } catch (err) {
      this.apiInstance.logger.debug(`Error fetching room ${id}:`, err);
      throw err;
    }
  }
}

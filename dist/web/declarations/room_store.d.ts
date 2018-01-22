import { Instance } from 'pusher-platform';
import Room from './room';
export interface RoomStoreOptions {
    rooms: Room[];
    apiInstance: Instance;
}
export default class RoomStore {
    rooms: Room[];
    apiInstance: Instance;
    constructor(options: RoomStoreOptions);
    room(id: number): Promise<Room>;
    addOrMerge(room: Room): Room;
    remove(id: number): Room | undefined;
    getRoom(id: number): Promise<Room>;
}

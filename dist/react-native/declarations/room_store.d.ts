import { Instance } from 'pusher-platform';
import Room from './room';
export interface RoomStoreOptions {
    rooms: Room[];
    instance: Instance;
}
export default class RoomStore {
    rooms: Room[];
    instance: Instance;
    constructor(options: RoomStoreOptions);
    room(id: number, onSuccess: (room: Room) => void, onError: (error: Error) => void): void;
    addOrMerge(room: Room): Room;
    remove(id: number): Room | undefined;
    findOrGetRoom(id: number, onSuccess: (room: Room) => void, onError: (error: Error) => void): void;
    getRoom(id: number, onSuccess: (room: Room) => void, onError: (error: Error) => void): void;
}

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
    userIds?: Array<string>;
}
export default class Room {
    id: number;
    name: string;
    isPrivate: boolean;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    userIds: Array<string>;
    userStore: RoomUserStore;
    subscription?: RoomSubscription;
    constructor(options: RoomOptions);
    updateWithPropertiesOfRoom(room: Room): void;
}

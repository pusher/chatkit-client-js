import { Instance, SubscriptionEvent } from 'pusher-platform';
import ChatManagerDelegate from './chat_manager_delegate';
import GlobalUserStore from './global_user_store';
import RoomStore from './room_store';
export interface PresenceSubscriptionOptions {
    apiInstance: Instance;
    userStore: GlobalUserStore;
    roomStore: RoomStore;
    delegate?: ChatManagerDelegate;
}
export default class PresenceSubscription {
    userStore: GlobalUserStore;
    roomStore: RoomStore;
    delegate?: ChatManagerDelegate;
    private apiInstance;
    constructor(options: PresenceSubscriptionOptions);
    handleEvent(event: SubscriptionEvent): void;
    end(): void;
    parseInitialStatePayload(eventName: string, data: any, userStore: GlobalUserStore): void;
    parsePresenceUpdatePayload(eventName: string, data: any, userStore: GlobalUserStore): void;
    parseJoinRoomPresenceUpdatePayload(eventName: string, data: any, userStore: GlobalUserStore): void;
}

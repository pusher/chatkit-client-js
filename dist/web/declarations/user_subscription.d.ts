import { Instance, SubscriptionEvent } from 'pusher-platform';
import ChatManagerDelegate from './chat_manager_delegate';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import Room from './room';
export interface UserSubscriptionOptions {
    instance: Instance;
    userStore: GlobalUserStore;
    delegate?: ChatManagerDelegate;
    connectCompletionHandler: (currentUser?: CurrentUser, error?: any) => void;
}
export default class UserSubscription {
    private instance;
    userStore: GlobalUserStore;
    delegate: ChatManagerDelegate;
    connectCompletionHandlers: [(CurrentUser?, Error?) => void];
    currentUser?: CurrentUser;
    constructor(options: UserSubscriptionOptions);
    handleEvent(event: SubscriptionEvent): void;
    callConnectCompletionHandlers(currentUser?: CurrentUser, error?: Error): void;
    parseInitialStatePayload(eventName: string, data: any, userStore: GlobalUserStore): void;
    fetchInitialUserInformationForUserIds(userIds: Set<string>, currentUser: CurrentUser): void;
    reconcileExistingRoomStoreWithRoomsReceivedOnConnection(roomsFromConnection: Room[]): void;
    parseAddedToRoomPayload(eventName: string, data: any): void;
    parseRemovedFromRoomPayload(eventName: string, data: any): void;
    parseRoomUpdatedPayload(eventName: string, data: any): void;
    parseRoomDeletedPayload(eventName: string, data: any): void;
    parseUserJoinedPayload(eventName: string, data: any): void;
    parseUserLeftPayload(eventName: string, data: any): void;
    parseTypingStartPayload(eventName: string, data: any, userId: string): void;
    parseTypingStopPayload(eventName: string, data: any, userId: string): void;
}

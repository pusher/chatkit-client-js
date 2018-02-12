import { Instance, SubscriptionEvent } from 'pusher-platform';
import ChatManagerDelegate from './chat_manager_delegate';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import Room from './room';
export interface UserSubscriptionOptions {
    apiInstance: Instance;
    filesInstance: Instance;
    cursorsInstance: Instance;
    userStore: GlobalUserStore;
    delegate?: ChatManagerDelegate;
    connectCompletionHandler: (currentUser?: CurrentUser, error?: any) => void;
}
export default class UserSubscription {
    userStore: GlobalUserStore;
    delegate?: ChatManagerDelegate;
    connectCompletionHandlers: [(currentUser?: CurrentUser, error?: any) => void];
    currentUser?: CurrentUser;
    private apiInstance;
    private filesInstance;
    private cursorsInstance;
    private typingTimers;
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
    parseIsTypingPayload(eventName: string, data: any, userId: string): void;
    private startedTyping(roomId, userId);
    private stoppedTyping(roomId, userId);
}

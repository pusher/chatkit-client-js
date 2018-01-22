import { Logger, SubscriptionEvent } from 'pusher-platform';
import BasicCursor from './basic_cursor';
import GlobalUserStore from './global_user_store';
import Room from './room';
import RoomDelegate from './room_delegate';
export interface CursorSubscriptionOptions {
    delegate?: RoomDelegate;
    logger: Logger;
    room: Room;
    userStore: GlobalUserStore;
    handleCursorSetInternal: (cursor: BasicCursor) => void;
}
export default class CursorSubscription {
    delegate?: RoomDelegate;
    logger: Logger;
    room: Room;
    userStore: GlobalUserStore;
    handleCursorSetInternal: (cursor: BasicCursor) => void;
    constructor(options: CursorSubscriptionOptions);
    handleEvent(event: SubscriptionEvent): Promise<void>;
    private enrich(basicCursor);
}

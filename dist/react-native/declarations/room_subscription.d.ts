import { Logger, SubscriptionEvent } from 'pusher-platform';
import BasicMessageEnricher from './basic_message_enricher';
import RoomDelegate from './room_delegate';
export interface RoomSubscriptionOptions {
    delegate?: RoomDelegate;
    basicMessageEnricher: BasicMessageEnricher;
    logger: Logger;
}
export default class RoomSubscription {
    delegate?: RoomDelegate;
    basicMessageEnricher: BasicMessageEnricher;
    logger: Logger;
    constructor(options: RoomSubscriptionOptions);
    handleEvent(event: SubscriptionEvent): void;
}

import { Logger } from 'pusher-platform';
import BasicMessage from './basic_message';
import GlobalUserStore from './global_user_store';
import Message from './message';
import Room from './room';
import User from './user';
export interface MessageEnrichmentCompletionHandlers {
    onSuccess: (message: Message) => void;
    onError: (error: any) => void;
}
export declare type MessageIdsToCompletionHandlers = {
    [key: number]: MessageEnrichmentCompletionHandlers;
};
export declare type UserIdsToBasicMessageIds = {
    [key: string]: number[];
};
export declare type MessageEnrichmentResult = Message | any;
export declare type MessageIdsToEnrichmentResults = {
    [key: number]: MessageEnrichmentResult;
};
export declare type MessageIdsToBasicMessages = {
    [key: number]: BasicMessage;
};
export default class BasicMessageEnricher {
    userStore: GlobalUserStore;
    room: Room;
    logger: Logger;
    private completionOrderList;
    private messageIdToCompletionHandlers;
    private enrichedMessagesAwaitingCompletionCalls;
    private userIdsBeingRetrieved;
    private userIdsToBasicMessageIds;
    private messagesAwaitingEnrichmentDependentOnUserRetrieval;
    constructor(userStore: GlobalUserStore, room: Room, logger: Logger);
    enrich(basicMessage: BasicMessage, onSuccess: (message: Message) => void, onError: (error: any) => void): void;
    enrichMessagesWithUser(user: User, messages: BasicMessage[]): void;
    callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(id: number, result: MessageEnrichmentResult): void;
}

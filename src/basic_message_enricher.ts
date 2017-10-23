import BasicMessage from './basic_message';
import GlobalUserStore from './global_user_store';
import Message from './message';
import Room from './room';
import User from './user';

export interface MessageEnrichmentCompletionHandlers {
  onSuccess: (message: Message) => void;
  onError: (error: any) => void;
}

export type MessageIdsToCompletionHandlers = {
  [key: number]: MessageEnrichmentCompletionHandlers;
}

export type UserIdsToBasicMessageIds = {
  [key: string]: number[];
}

export type MessageEnrichmentResult = Message | any;

export type MessageIdsToEnrichmentResults = {
  [key: number]: MessageEnrichmentResult;
}

export type MessageIdsToBasicMessages = {
  [key: number]: BasicMessage;
}


export default class BasicMessageEnricher {
  userStore: GlobalUserStore;
  room: Room;

  private completionOrderList: number[] = [];
  private messageIdToCompletionHandlers: MessageIdsToCompletionHandlers = {};
  private enrichedMessagesAwaitingCompletionCalls: MessageIdsToEnrichmentResults = {};

  private userIdsBeingRetrieved: string[] = [];
  private userIdsToBasicMessageIds: UserIdsToBasicMessageIds = {};
  private messagesAwaitingEnrichmentDependentOnUserRetrieval: MessageIdsToBasicMessages = {};


  // TODO: Logger stuff
  constructor(userStore: GlobalUserStore, room: Room) {
    this.userStore = userStore;
    this.room = room;
  }

  enrich(basicMessage: BasicMessage, onSuccess: (message: Message) => void, onError: (error: any) => void) {
    const basicMessageId = basicMessage.id;
    const basicMessageSenderId = basicMessage.senderId;

    this.completionOrderList.push(basicMessageId);
    this.messageIdToCompletionHandlers[basicMessageId] = {
      onSuccess,
      onError,
    };

    if (this.userIdsToBasicMessageIds[basicMessageSenderId] === undefined) {
      this.userIdsToBasicMessageIds[basicMessageSenderId] = [basicMessageId];
    } else {
      this.userIdsToBasicMessageIds[basicMessageSenderId].push(basicMessageId);
    }

    this.messagesAwaitingEnrichmentDependentOnUserRetrieval[basicMessageId] = basicMessage;

    if (this.userIdsBeingRetrieved.indexOf(basicMessageSenderId) > -1) {
      return;
    } else {
      this.userIdsBeingRetrieved.push(basicMessageSenderId);
    }

    this.userStore.user(
      basicMessageSenderId,
      (user) => {
        const basicMessageIds = this.userIdsToBasicMessageIds[basicMessageSenderId];

        if (basicMessageIds === undefined) {
          // strongSelf.logger.log(
          //     "Fetched user information for user with id \(user.id) but no messages needed information for this user",
          //     logLevel: .verbose
          // )
          return;
        }

        // TODO: Is this right?
        const basicMessages = basicMessageIds.map(bmId => {
          return this.messagesAwaitingEnrichmentDependentOnUserRetrieval[bmId];
        }).filter(el => el !== undefined);

        this.enrichMessagesWithUser(user, basicMessages);

        const indexToRemove = this.userIdsBeingRetrieved.indexOf(basicMessageSenderId);
        if (indexToRemove > -1) {
          this.userIdsBeingRetrieved.splice(indexToRemove, 1);
        }
      },
      (error) => {
        // strongSelf.logger.log(
        //     "Unable to find user with id \(basicMessage.senderId), associated with message \(basicMessageId). Error: \(err!.localizedDescription)",
        //     logLevel: .debug
        // )
        // strongSelf.callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(id: basicMessageId, result: .error(err!))
      }
    )
  }

  enrichMessagesWithUser(user: User, messages: BasicMessage[]) {
    messages.forEach(basicMessage => {
      const message = {
        id: basicMessage.id,
        text: basicMessage.text,
        createdAt: basicMessage.createdAt,
        updatedAt: basicMessage.updatedAt,
        sender: user,
        room: this.room,
      };
      this.callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(basicMessage.id, message);
    })
  }

  callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(id: number, result: MessageEnrichmentResult) {

    // TODO: There may well be ways to make this faster
    const nextIdToComplete = this.completionOrderList[0];
    if (nextIdToComplete === undefined) {
      return;
    }

    this.enrichedMessagesAwaitingCompletionCalls[id] = result;

    if (id !== nextIdToComplete) {
      // If the message id received isn't the next to have its completionHandler called
      // then return as we've already stored the result so it can be used later
      // TODO: Fixme
      // self.logger.log(
      //     "Waiting to call completion handler for message id \(id) as there are other older messages still to be enriched",
      //     logLevel: .verbose
      // )
      return;
    }

    do {
      const messageId = this.completionOrderList[0];

      const completionHandler = this.messageIdToCompletionHandlers[messageId];
      if (completionHandler === undefined) {
        // self.logger.log("Completion handler not stored for message id \(messageId)", logLevel: .debug)
        return;
      }

      const result = this.enrichedMessagesAwaitingCompletionCalls[messageId];
      if (result === undefined) {
        // self.logger.log("Enrichment result not stored for message id \(messageId)", logLevel: .debug)
        return;
      }

      // TODO: PROPERLY CHECK IF IT'S A MESSAGE OR AN ERROR - NOT THIS FILTHY HACK
      if (result['sender'] !== undefined) {
        completionHandler.onSuccess(result);
      } else {
        completionHandler.onError(result);
      }

      this.completionOrderList.shift();
      this.messageIdToCompletionHandlers[messageId] = undefined; // TODO: Is this right?
      this.enrichedMessagesAwaitingCompletionCalls[messageId] = undefined;
    } while (this.completionOrderList[0] !== undefined && this.enrichedMessagesAwaitingCompletionCalls[this.completionOrderList[0]] !== undefined);
  }
}

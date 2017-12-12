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

export type MessageIdsToCompletionHandlers = {
  [key: number]: MessageEnrichmentCompletionHandlers;
};

export type UserIdsToBasicMessageIds = {
  [key: string]: number[];
};

export type MessageEnrichmentResult = Message | any;

export type MessageIdsToEnrichmentResults = {
  [key: number]: MessageEnrichmentResult;
};

export type MessageIdsToBasicMessages = {
  [key: number]: BasicMessage;
};

export default class BasicMessageEnricher {
  userStore: GlobalUserStore;
  room: Room;
  logger: Logger;

  private completionOrderList: number[] = [];
  private messageIdToCompletionHandlers: MessageIdsToCompletionHandlers = {};
  private enrichedMessagesAwaitingCompletionCalls: MessageIdsToEnrichmentResults = {};

  private userIdsBeingRetrieved: string[] = [];
  private userIdsToBasicMessageIds: UserIdsToBasicMessageIds = {};
  private messagesAwaitingEnrichmentDependentOnUserRetrieval: MessageIdsToBasicMessages = {};

  constructor(userStore: GlobalUserStore, room: Room, logger: Logger) {
    this.userStore = userStore;
    this.room = room;
    this.logger = logger;
  }

  enrich(
    basicMessage: BasicMessage,
    onSuccess: (message: Message) => void,
    onError: (error: any) => void,
  ) {
    const basicMessageId = basicMessage.id;
    const basicMessageSenderId = basicMessage.senderId;

    this.completionOrderList.push(basicMessageId);
    this.messageIdToCompletionHandlers[basicMessageId] = {
      onError,
      onSuccess,
    };

    if (this.userIdsToBasicMessageIds[basicMessageSenderId] === undefined) {
      this.userIdsToBasicMessageIds[basicMessageSenderId] = [basicMessageId];
    } else {
      this.userIdsToBasicMessageIds[basicMessageSenderId].push(basicMessageId);
    }

    this.messagesAwaitingEnrichmentDependentOnUserRetrieval[
      basicMessageId
    ] = basicMessage;

    if (this.userIdsBeingRetrieved.indexOf(basicMessageSenderId) > -1) {
      return;
    } else {
      this.userIdsBeingRetrieved.push(basicMessageSenderId);
    }

    this.userStore.user(
      basicMessageSenderId,
      user => {
        const basicMessageIds = this.userIdsToBasicMessageIds[
          basicMessageSenderId
        ];

        if (basicMessageIds === undefined) {
          this.logger.verbose(
            `Fetched user information for user with id ${
              user.id
            } but no messages needed information for this user`,
          );
          return;
        }

        // TODO: Is this right?
        const basicMessages = basicMessageIds
          .map(bmId => {
            return this.messagesAwaitingEnrichmentDependentOnUserRetrieval[
              bmId
            ];
          })
          .filter(el => el !== undefined);

        this.enrichMessagesWithUser(user, basicMessages);

        const indexToRemove = this.userIdsBeingRetrieved.indexOf(
          basicMessageSenderId,
        );
        if (indexToRemove > -1) {
          this.userIdsBeingRetrieved.splice(indexToRemove, 1);
        }
      },
      error => {
        this.logger.debug(
          `Unable to find user with id ${
            basicMessage.senderId
          }, associated with message ${basicMessageId}. Error:`,
          error,
        );
        this.callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(
          basicMessageId,
          error,
        );
      },
    );
  }

  enrichMessagesWithUser(user: User, messages: BasicMessage[]) {
    messages.forEach(basicMessage => {
      const message = {
        attachment: basicMessage.attachment,
        createdAt: basicMessage.createdAt,
        id: basicMessage.id,
        room: this.room,
        sender: user,
        text: basicMessage.text,
        updatedAt: basicMessage.updatedAt,
      };
      this.callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(
        basicMessage.id,
        message,
      );
    });
  }

  callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(
    id: number,
    result: MessageEnrichmentResult,
  ) {
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
      this.logger.verbose(
        `Waiting to call completion handler for message id ${id} as there are other older messages still to be enriched`,
      );
      return;
    }

    do {
      // TODO: I think this could get stuck in a loop forever if there's no
      // completion handler stored for a message with a given id
      const messageId = this.completionOrderList[0];

      const completionHandler = this.messageIdToCompletionHandlers[messageId];
      if (completionHandler === undefined) {
        this.logger.verbose(
          `Completion handler not stored for message id ${messageId}`,
        );
        return;
      }

      const res = this.enrichedMessagesAwaitingCompletionCalls[messageId];
      if (res === undefined) {
        this.logger.verbose(
          `Enrichment result not stored for message id ${messageId}`,
        );
        return;
      }

      // TODO: PROPERLY CHECK IF IT'S A MESSAGE OR AN ERROR - NOT THIS FILTHY HACK
      if (res.sender !== undefined) {
        completionHandler.onSuccess(res);
      } else {
        completionHandler.onError(res);
      }

      this.completionOrderList.shift();
      delete this.messageIdToCompletionHandlers[messageId];
      delete this.enrichedMessagesAwaitingCompletionCalls[messageId];
    } while (
      this.completionOrderList[0] !== undefined &&
      this.enrichedMessagesAwaitingCompletionCalls[
        this.completionOrderList[0]
      ] !== undefined
    );
  }
}

import { Instance, Logger, SubscriptionEvent } from 'pusher-platform';

import BasicCursor from './basic_cursor';
import Cursor from './cursor';
import GlobalUserStore from './global_user_store';
import PayloadDeserializer from './payload_deserializer';
import Room from './room';
import RoomDelegate from './room_delegate';

export interface CursorSubscriptionOptions {
  delegate?: RoomDelegate;
  logger: Logger;
  room: Room;
  userStore: GlobalUserStore;
}

export default class CursorSubscription {
  delegate?: RoomDelegate;
  logger: Logger;
  room: Room;
  userStore: GlobalUserStore;

  constructor(options: CursorSubscriptionOptions) {
    this.delegate = options.delegate;
    this.logger = options.logger;
    this.room = options.room;
    this.userStore = options.userStore;
  }

  handleEvent(event: SubscriptionEvent) {
    const { body, eventId, headers } = event;
    const { data } = body;
    const eventName = body.event_name;
    if (eventName !== 'cursor_set') {
      this.logger.verbose(
        `Cursor subscription received event with type ${eventName}, when 'cursor_set' was expected`,
      );
      return;
    }
    this.logger.verbose(`Received event name: ${eventName}, and data: ${data}`);
    const basicCursor = PayloadDeserializer.createBasicCursorFromPayload(data);
    this.logger.verbose(`Room received cursor for: ${basicCursor.userId}`);
    this.enrich(
      basicCursor,
      cursor => {
        if (this.delegate && this.delegate.cursorSet) {
          this.delegate.cursorSet(cursor);
        }
      },
      error => {
        this.logger.debug('Error receiving cursor:', error);
      },
    );
  }

  enrich(
    basicCursor: BasicCursor,
    onSuccess: (cursor: Cursor) => void,
    onError: (error: any) => void,
  ) {
    this.userStore.user(
      basicCursor.userId,
      user => {
        onSuccess({
          cursorType: basicCursor.cursorType,
          position: basicCursor.position,
          room: this.room,
          updatedAt: basicCursor.updatedAt,
          user,
        });
      },
      error => {
        this.logger.debug(
          `Unable to find user with id ${basicCursor.userId}. Error:`,
          error,
        );
        onError(error);
      },
    );
  }
}

import { Instance, Logger, SubscriptionEvent } from 'pusher-platform';

import PayloadDeserializer from './payload_deserializer';
import RoomDelegate from './room_delegate';

export interface CursorSubscriptionOptions {
  delegate?: RoomDelegate;
  logger: Logger;
}

export default class CursorSubscription {
  delegate?: RoomDelegate;
  logger: Logger;

  constructor(options: CursorSubscriptionOptions) {
    this.delegate = options.delegate;
    this.logger = options.logger;
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
    // TODO enrich

    this.logger.verbose(`Room received cursor for: ${basicCursor.userId}`);

    if (this.delegate && this.delegate.cursorSet) {
      this.delegate.cursorSet(basicCursor);
    }
  }
}

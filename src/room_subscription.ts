import {
  Instance,
  SubscriptionEvent,
} from 'pusher-platform';

import BasicMessageEnricher from './basic_message_enricher';
import RoomDelegate from './room_delegate';
import PayloadDeserializer from './payload_deserializer';
import User from './user';


export interface RoomSubscriptionOptions {
  delegate?: RoomDelegate;
  basicMessageEnricher: BasicMessageEnricher;
  // logger
}

export default class RoomSubscription {
  delegate: RoomDelegate;
  basicMessageEnricher: BasicMessageEnricher;

  constructor(options: RoomSubscriptionOptions) {
    this.delegate = options.delegate;
    this.basicMessageEnricher = options.basicMessageEnricher;
  }

  handleEvent(event: SubscriptionEvent) {
    const { body, eventId, headers } = event;
    const { data } = body;
    const eventName = body.event_name;

    if (eventName !== 'new_message') {
      console.log("Room sub got an event type it doesn't understand");
      // TODO: Logging properly
      return;
    }

    // self.instance.logger.log("Received event name: \(eventNameString), and data: \(apiEventData)", logLevel: .verbose)

    const basicMessage = PayloadDeserializer.createBasicMessageFromPayload(data);

    this.basicMessageEnricher.enrich(
      basicMessage,
      (message) => {
        // strongSelf.delegate?.newMessage(message: message)
        // strongSelf.logger.log("Room received new message: \(message.text)", logLevel: .verbose)
      },
      (error) => {
        console.log("Error receiving new message", error);
        // TODO: Proper logging and delegate stuff
      }
    )
  }
}

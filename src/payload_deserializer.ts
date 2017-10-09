import {
  Instance,
} from 'pusher-platform';

import GlobalUserStore from './global_user_store';
import BasicUser from './basic_user';
import BasicMessage from './basic_message';
import PresencePayload from './presence_payload';
import CurrentUser from './current_user';
import Room from './room';


export default class PayloadDeserializer {

  constructor() {}

  createUserFromPayload(userPaylod: any): User {

  }

  createCurrentUserFromPayload(userPaylod: any, instance: Instance, userStore: GlobalUserStore): CurrentUser {

  }

  createRoomFromPayload(roomPayload: any): Room {

  }

  createBasicMessageFromPayload(messagePayload: any): BasicMessage {

  }

  createPresencePayloadFromPayload(payload: any): PresencePayload {

  }

  createBasicUserFromPayload(payload: any): BasicUser {

  }
}

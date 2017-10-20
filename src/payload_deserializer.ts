import {
  Instance,
} from 'pusher-platform';

import BasicMessage from './basic_message';
import BasicUser from './basic_user';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import PresencePayload from './presence_payload';
import PresenceState from './presence_state';
import Room from './room';
import User from './user';


export default class PayloadDeserializer {

  constructor() {}

  static createUserFromPayload(userPayload: any): User {
    const basicUser = PayloadDeserializer.createBasicUserFromPayload(userPayload);

    return new User({
      id: basicUser.id,
      createdAt: basicUser.createdAt,
      updatedAt: basicUser.updatedAt,
      name: userPayload.name,
      avatarURL: userPayload.avatar_url,
      customData: userPayload.custom_data,
    });
  }

  static createCurrentUserFromPayload(userPayload: any, instance: Instance, userStore: GlobalUserStore): CurrentUser {
    const basicUser = PayloadDeserializer.createBasicUserFromPayload(userPayload);

    return new CurrentUser({
      id: basicUser.id,
      createdAt: basicUser.createdAt,
      updatedAt: basicUser.updatedAt,
      name: userPayload.name,
      avatarURL: userPayload.avatar_url,
      customData: userPayload.custom_data,
      instance,
      userStore,
    });
  }

  static createRoomFromPayload(roomPayload: any): Room {
    const requiredFieldsWithTypes = {
      id: 'number',
      name: 'string',
      private: 'boolean',
      created_by_id: 'string',
      created_at: 'string',
      updated_at: 'string',
    };

    Object.keys(requiredFieldsWithTypes).forEach(key => {
      if (roomPayload[key] === undefined) {
        throw new Error(`Payload missing key: ${key}`);
      }

      const receivedType = typeof roomPayload[key];
      const expectedType = requiredFieldsWithTypes[key];

      if (receivedType !== expectedType) {
        throw new Error(`Value for key: ${key} in payload was ${receivedType}, expected ${expectedType}`);
      }
    });

    let memberUserIds: Array<string>;

    if (roomPayload.member_user_ids) {
      memberUserIds = roomPayload.member_user_ids;
    }

    return new Room({
      id: roomPayload.id,
      name: roomPayload.name,
      isPrivate: roomPayload.private,
      createdByUserId: roomPayload.created_by_id,
      createdAt: roomPayload.created_at,
      updatedAt: roomPayload.updated_at,
      deletedAt: roomPayload.deleted_at,
      userIds: memberUserIds,
    });
  }

  // This returns a PCBasicMessage mainly to signal that it needs to be enriched with
  // information about its associated sender and the room it belongs to
  static createBasicMessageFromPayload(messagePayload: any): BasicMessage {
    const requiredFieldsWithTypes = {
      id: 'number',
      user_id: 'string',
      room_id: 'number',
      text: 'string',
      created_at: 'string',
      updated_at: 'string',
    };

    Object.keys(requiredFieldsWithTypes).forEach(key => {
      if (messagePayload[key] === undefined) {
        throw new Error(`Payload missing key: ${key}`);
      }

      const receivedType = typeof messagePayload[key];
      const expectedType = requiredFieldsWithTypes[key];

      if (receivedType !== expectedType) {
        throw new Error(`Value for key: ${key} in payload was ${receivedType}, expected ${expectedType}`);
      }
    });

    return {
      id: messagePayload.id,
      senderId: messagePayload.user_id,
      roomId: messagePayload.id,
      text: messagePayload.text,
      createdAt: messagePayload.created_at,
      updatedAt: messagePayload.updated_at,
    }
  }

  static createPresencePayloadFromPayload(payload: any): PresencePayload {
    const requiredFieldsWithTypes = {
      user_id: 'string',
      state: 'string',
    };

    Object.keys(requiredFieldsWithTypes).forEach(key => {
      if (payload[key] === undefined) {
        throw new Error(`Payload missing key: ${key}`);
      }

      const receivedType = typeof payload[key];
      const expectedType = requiredFieldsWithTypes[key];

      if (receivedType !== expectedType) {
        throw new Error(`Value for key: ${key} in payload was ${receivedType}, expected ${expectedType}`);
      }
    });

    const state = new PresenceState(payload.state);

    return {
      userId: payload.user_id,
      state: state,
      lastSeenAt: payload.last_seen_at,
    }
  }

  static createBasicUserFromPayload(payload: any): BasicUser {
    const requiredFieldsWithTypes = {
      id: 'string',
      created_at: 'string',
      updated_at: 'string',
    };

    Object.keys(requiredFieldsWithTypes).forEach(key => {
      if (payload[key] === undefined) {
        throw new Error(`Payload missing key: ${key}`);
      }

      const receivedType = typeof payload[key];
      const expectedType = requiredFieldsWithTypes[key];

      if (receivedType !== expectedType) {
        throw new Error(`Value for key: ${key} in payload was ${receivedType}, expected ${expectedType}`);
      }
    });

    return {
      id: payload.id,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    };
  }
}

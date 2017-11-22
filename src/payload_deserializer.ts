import { Instance } from 'pusher-platform';

import BasicMessage from './basic_message';
import BasicUser from './basic_user';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import PresencePayload from './presence_payload';
import PresenceState from './presence_state';
import Room from './room';
import User from './user';

export default class PayloadDeserializer {
  static createUserFromPayload(userPayload: any): User {
    const basicUser = PayloadDeserializer.createBasicUserFromPayload(
      userPayload,
    );

    return new User({
      avatarURL: userPayload.avatar_url,
      createdAt: basicUser.createdAt,
      customData: userPayload.custom_data,
      id: basicUser.id,
      name: userPayload.name,
      updatedAt: basicUser.updatedAt,
    });
  }

  static createCurrentUserFromPayload(
    userPayload: any,
    instance: Instance,
    userStore: GlobalUserStore,
  ): CurrentUser {
    const basicUser = PayloadDeserializer.createBasicUserFromPayload(
      userPayload,
    );

    return new CurrentUser({
      avatarURL: userPayload.avatar_url,
      createdAt: basicUser.createdAt,
      customData: userPayload.custom_data,
      id: basicUser.id,
      instance,
      name: userPayload.name,
      updatedAt: basicUser.updatedAt,
      userStore,
    });
  }

  static createRoomFromPayload(roomPayload: any): Room {
    const requiredFieldsWithTypes: { [key: string]: string; } = {
      created_at: 'string',
      created_by_id: 'string',
      id: 'number',
      name: 'string',
      private: 'boolean',
      updated_at: 'string',
    };

    Object.keys(requiredFieldsWithTypes).forEach(key => {
      if (roomPayload[key] === undefined) {
        throw new Error(`Payload missing key: ${key}`);
      }

      const receivedType = typeof roomPayload[key];
      const expectedType = requiredFieldsWithTypes[key];

      if (receivedType !== expectedType) {
        throw new Error(
          `Value for key: ${key} in payload was ${receivedType}, expected ${
            expectedType
          }`,
        );
      }
    });

    let memberUserIds: string[] = [];

    if (roomPayload.member_user_ids) {
      memberUserIds = roomPayload.member_user_ids;
    }

    return new Room({
      createdAt: roomPayload.created_at,
      createdByUserId: roomPayload.created_by_id,
      deletedAt: roomPayload.deleted_at,
      id: roomPayload.id,
      isPrivate: roomPayload.private,
      name: roomPayload.name,
      updatedAt: roomPayload.updated_at,
      userIds: memberUserIds,
    });
  }

  // This returns a PCBasicMessage mainly to signal that it needs to be enriched with
  // information about its associated sender and the room it belongs to
  static createBasicMessageFromPayload(messagePayload: any): BasicMessage {
    const requiredFieldsWithTypes: { [key: string]: string; } = {
      created_at: 'string',
      id: 'number',
      room_id: 'number',
      text: 'string',
      updated_at: 'string',
      user_id: 'string',
    };

    Object.keys(requiredFieldsWithTypes).forEach(key => {
      if (messagePayload[key] === undefined) {
        throw new Error(`Payload missing key: ${key}`);
      }

      const receivedType = typeof messagePayload[key];
      const expectedType = requiredFieldsWithTypes[key];

      if (receivedType !== expectedType) {
        throw new Error(
          `Value for key: ${key} in payload was ${receivedType}, expected ${
            expectedType
          }`,
        );
      }
    });

    return {
      createdAt: messagePayload.created_at,
      id: messagePayload.id,
      roomId: messagePayload.id,
      senderId: messagePayload.user_id,
      text: messagePayload.text,
      updatedAt: messagePayload.updated_at,
    };
  }

  static createPresencePayloadFromPayload(payload: any): PresencePayload {
    const requiredFieldsWithTypes: { [key: string]: string; } = {
      state: 'string',
      user_id: 'string',
    };

    Object.keys(requiredFieldsWithTypes).forEach(key => {
      if (payload[key] === undefined) {
        throw new Error(`Payload missing key: ${key}`);
      }

      const receivedType = typeof payload[key];
      const expectedType = requiredFieldsWithTypes[key];

      if (receivedType !== expectedType) {
        throw new Error(
          `Value for key: ${key} in payload was ${receivedType}, expected ${
            expectedType
          }`,
        );
      }
    });

    const state = new PresenceState(payload.state);

    return {
      lastSeenAt: payload.last_seen_at,
      state,
      userId: payload.user_id,
    };
  }

  static createBasicUserFromPayload(payload: any): BasicUser {
    const requiredFieldsWithTypes: { [key: string]: string; } = {
      created_at: 'string',
      id: 'string',
      updated_at: 'string',
    };

    Object.keys(requiredFieldsWithTypes).forEach(key => {
      if (payload[key] === undefined) {
        throw new Error(`Payload missing key: ${key}`);
      }

      const receivedType = typeof payload[key];
      const expectedType = requiredFieldsWithTypes[key];

      if (receivedType !== expectedType) {
        throw new Error(
          `Value for key: ${key} in payload was ${receivedType}, expected ${
            expectedType
          }`,
        );
      }
    });

    return {
      createdAt: payload.created_at,
      id: payload.id,
      updatedAt: payload.updated_at,
    };
  }
}

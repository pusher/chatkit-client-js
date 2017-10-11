import {
  Instance,
} from 'pusher-platform';

import GlobalUserStore from './global_user_store';
import BasicUser from './basic_user';
import BasicMessage from './basic_message';
import PresencePayload from './presence_payload';
import CurrentUser from './current_user';
import User from './user';
import Room from './room';


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

    let memberUserIdsSet: Set<string>;

    if (roomPayload.member_user_ids) {
      memberUserIdsSet = new Set<string>(roomPayload.member_user_ids);
    }

    return new Room({
      id: roomPayload.id,
      name: roomPayload.name,
      isPrivate: roomPayload.private,
      createdByUserId: roomPayload.created_by_id,
      createdAt: roomPayload.created_at,
      updatedAt: roomPayload.updated_at,
      deletedAt: roomPayload.deleted_at,
      userIds: memberUserIdsSet,
    });
  }

  // static createBasicMessageFromPayload(messagePayload: any): BasicMessage {

  // }

  // static createPresencePayloadFromPayload(payload: any): PresencePayload {

  // }

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

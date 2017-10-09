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

  // static createUserFromPayload(userPaylod: any): User {

  // }

  static createCurrentUserFromPayload(userPayload: any, instance: Instance, userStore: GlobalUserStore): CurrentUser {
    const basicUser = PayloadDeserializer.createBasicUserFromPayload(userPayload)

    return new CurrentUser({
      id: basicUser.id,
      createdAt: basicUser.createdAt,
      updatedAt: basicUser.updatedAt,
      name: userPayload.name,
      avatarURL: userPayload.avatar_url,
      customData: userPayload.custom_data,
      instance,
      userStore,
    })
  }

  static createRoomFromPayload(roomPayload: any): Room {
    guard
        let roomId = roomPayload["id"] as? Int,
        let roomName = roomPayload["name"] as? String,
        let isPrivate = roomPayload["private"] as? Bool,
        let roomCreatorUserId = roomPayload["created_by_id"] as? String,
        let roomCreatedAt = roomPayload["created_at"] as? String,
        let roomUpdatedAt = roomPayload["updated_at"] as? String
    else {
        throw PCPayloadDeserializerError.incompleteOrInvalidPayloadToCreteEntity(type: String(describing: PCRoom.self), payload: roomPayload)
    }

    var memberUserIdsSet: Set<String>?

    if let memberUserIds = roomPayload["member_user_ids"] as? [String] {
        memberUserIdsSet = Set<String>(memberUserIds)
    }

    const requiredFieldsWithTypes = {
      id: 'string',
      name: 'string',
      private: 'boolean',
      id: 'string',
      created_at: 'string',
      updated_at: 'string',
    };

    Object.keys(requiredFieldsWithTypes).forEach(key => {
      if (!payload[key]) {
        throw new Error(`Payload missing key: ${key}`);
      }

      const receivedType = typeof payload[key];
      const expectedType = requiredFieldsWithTypes[key];

      if (receivedType !== expectedType) {
        throw new Error(`Value for key: ${key} in payload was ${receivedType}, expected ${expectedType}`);
      }
    });



    return new Room({
      id: roomId,
      name: roomName,
      isPrivate: isPrivate,
      createdByUserId: roomCreatorUserId,
      createdAt: roomCreatedAt,
      updatedAt: roomUpdatedAt,
      deletedAt: roomPayload.deleted_at,
      userIds: memberUserIdsSet,
    })
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
      if (!payload[key]) {
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
    }
  }
}

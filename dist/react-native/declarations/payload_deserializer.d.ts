import { Instance } from 'pusher-platform';
import BasicMessage from './basic_message';
import BasicUser from './basic_user';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import PresencePayload from './presence_payload';
import Room from './room';
import User from './user';
export default class PayloadDeserializer {
    static createUserFromPayload(userPayload: any): User;
    static createCurrentUserFromPayload(userPayload: any, instance: Instance, userStore: GlobalUserStore): CurrentUser;
    static createRoomFromPayload(roomPayload: any): Room;
    static createBasicMessageFromPayload(messagePayload: any): BasicMessage;
    static createPresencePayloadFromPayload(payload: any): PresencePayload;
    static createBasicUserFromPayload(payload: any): BasicUser;
}

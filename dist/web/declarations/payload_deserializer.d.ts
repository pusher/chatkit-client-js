import { Instance } from 'pusher-platform';
import Attachment from './attachment';
import BasicCursor from './basic_cursor';
import BasicMessage from './basic_message';
import BasicUser from './basic_user';
import CurrentUser from './current_user';
import FetchedAttachment from './fetched_attachment';
import GlobalUserStore from './global_user_store';
import PresencePayload from './presence_payload';
import Room from './room';
import User from './user';
export default class PayloadDeserializer {
    static createUserFromPayload(userPayload: any): User;
    static createCurrentUserFromPayload(userPayload: any, apiInstance: Instance, filesInstance: Instance, cursorsInstance: Instance, userStore: GlobalUserStore): CurrentUser;
    static createRoomFromPayload(roomPayload: any): Room;
    static createBasicMessageFromPayload(messagePayload: any): BasicMessage;
    static createBasicCursorFromPayload(payload: any): BasicCursor;
    static createPresencePayloadFromPayload(payload: any): PresencePayload;
    static createBasicUserFromPayload(payload: any): BasicUser;
    static createAttachmentFromPayload(payload: any): Attachment | undefined;
    static createFetchedAttachmentFromPayload(payload: any): FetchedAttachment | undefined;
}

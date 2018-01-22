import { Instance } from 'pusher-platform';
import BasicCursor from './basic_cursor';
import ChatManagerDelegate from './chat_manager_delegate';
import GlobalUserStore from './global_user_store';
import Message from './message';
import PresenceSubscription from './presence_subscription';
import Room from './room';
import RoomDelegate from './room_delegate';
import RoomStore from './room_store';
export interface CreateRoomOptions {
    name: string;
    private?: boolean;
    addUserIds?: string[];
}
export interface UpdateRoomOptions {
    name?: string;
    isPrivate?: boolean;
}
export interface FetchRoomMessagesOptions {
    initialId?: string;
    limit?: number;
    direction?: string;
}
export interface CurrentUserOptions {
    id: string;
    createdAt: string;
    updatedAt: string;
    name?: string;
    avatarURL?: string;
    customData?: any;
    rooms?: Room[];
    apiInstance: Instance;
    filesInstance: Instance;
    cursorsInstance: Instance;
    userStore: GlobalUserStore;
}
export interface DataAttachment {
    file: Blob;
    name: string;
}
export interface LinkAttachment {
    link: string;
    type: string;
}
export declare type GenericAttachment = LinkAttachment | DataAttachment;
export interface AttachmentBody {
    resource_link: string;
    type: string;
}
export interface SendMessageOptions {
    attachment?: GenericAttachment;
    roomId: number;
    text?: string;
}
export interface CompleteMessageOptions {
    attachment?: AttachmentBody;
    roomId: number;
    text?: string;
    user_id: string;
}
export default class CurrentUser {
    id: string;
    createdAt: string;
    cursors: {
        [roomId: string]: BasicCursor;
    };
    cursorsReq: Promise<void>;
    updatedAt: string;
    name?: string;
    avatarURL?: string;
    customData?: any;
    userStore: GlobalUserStore;
    roomStore: RoomStore;
    apiInstance: Instance;
    filesInstance: Instance;
    cursorsInstance: Instance;
    pathFriendlyId: string;
    presenceSubscription: PresenceSubscription;
    typingRequestSent: {
        [roomId: string]: number;
    };
    readonly rooms: Room[];
    constructor(options: CurrentUserOptions);
    updateWithPropertiesOf(currentUser: CurrentUser): void;
    setupPresenceSubscription(delegate?: ChatManagerDelegate): void;
    createRoom(options: CreateRoomOptions): Promise<Room>;
    populateRoomUserStore(room: Room): void;
    addUser(id: string, roomId: number): Promise<void>;
    removeUser(id: string, roomId: number): Promise<void>;
    updateRoom(roomId: number, options: UpdateRoomOptions): Promise<void>;
    deleteRoom(roomId: number): Promise<void>;
    addOrRemoveUsers(roomId: number, userIds: string[], membershipChange: string): Promise<void>;
    joinRoom(roomId: number): Promise<Room>;
    leaveRoom(roomId: number): Promise<void>;
    getJoinedRooms(): Promise<Room[]>;
    getJoinableRooms(): Promise<Room[]>;
    getUserRooms(onlyJoinable: boolean): Promise<Room[]>;
    getAllRooms(): Promise<Room[]>;
    isTypingIn(roomId: number): Promise<void>;
    setCursor(position: number, room: Room): Promise<void>;
    sendMessage(options: SendMessageOptions): Promise<number>;
    subscribeToRoom(room: Room, roomDelegate: RoomDelegate, messageLimit?: number): Promise<void>;
    fetchMessagesFromRoom(room: Room, fetchOptions: FetchRoomMessagesOptions): Promise<Message[]>;
    fetchAttachment(attachmentURL: string): Promise<any>;
    private isDataAttachment(attachment);
    private isLinkAttachment(attachment);
    private uploadFile(file, fileName, roomId);
    private sendMessageWithCompleteOptions(options);
    private subscribeToCursors(room, roomDelegate);
    private getRooms(path);
}

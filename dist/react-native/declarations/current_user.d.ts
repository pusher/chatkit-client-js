import { Instance } from 'pusher-platform';
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
    instance: Instance;
    userStore: GlobalUserStore;
}
export default class CurrentUser {
    id: string;
    createdAt: string;
    updatedAt: string;
    name?: string;
    avatarURL?: string;
    customData?: any;
    userStore: GlobalUserStore;
    roomStore: RoomStore;
    instance: Instance;
    pathFriendlyId: string;
    presenceSubscription: PresenceSubscription;
    readonly rooms: Room[];
    constructor(options: CurrentUserOptions);
    updateWithPropertiesOf(currentUser: CurrentUser): void;
    setupPresenceSubscription(delegate: ChatManagerDelegate): void;
    createRoom(options: CreateRoomOptions, onSuccess: (room: Room) => void, onError: (error: any) => void): void;
    populateRoomUserStore(room: Room): void;
    addUser(id: string, roomId: number, onSuccess: () => void, onError: (error: any) => void): void;
    removeUser(id: string, roomId: number, onSuccess: () => void, onError: (error: any) => void): void;
    updateRoom(roomId: number, options: UpdateRoomOptions, onSuccess: () => void, onError: (error: any) => void): void;
    deleteRoom(roomId: number, onSuccess: () => void, onError: (error: any) => void): void;
    addOrRemoveUsers(roomId: number, userIds: string[], membershipChange: string, onSuccess: () => void, onError: (error: any) => void): void;
    joinRoom(roomId: number, onSuccess: (room: Room) => void, onError: (error: any) => void): void;
    leaveRoom(roomId: number, onSuccess: () => void, onError: (error: any) => void): void;
    getJoinedRooms(onSuccess: (rooms: Room[]) => void, onError: (error: any) => void): void;
    getJoinableRooms(onSuccess: (rooms: Room[]) => void, onError: (error: any) => void): void;
    getUserRooms(onlyJoinable: boolean, onSuccess: (rooms: Room[]) => void, onError: (error: any) => void): void;
    getAllRooms(onSuccess: (rooms: Room[]) => void, onError: (error: any) => void): void;
    startedTypingIn(roomId: number, onSuccess: () => void, onError: (error: any) => void): void;
    stoppedTypingIn(roomId: number, onSuccess: () => void, onError: (error: any) => void): void;
    addMessage(text: string, room: Room, onSuccess: (messageId: number) => void, onError: (error: any) => void): void;
    subscribeToRoom(room: Room, roomDelegate: RoomDelegate, messageLimit?: number): void;
    fetchMessagesFromRoom(room: Room, fetchOptions: FetchRoomMessagesOptions, onSuccess: (messages: Message[]) => void, onError: (error: any) => void): void;
    private getRooms(path, onSuccess, onError);
    private typingStateChange(eventPayload, roomId, onSuccess, onError);
}

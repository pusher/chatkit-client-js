import { Instance } from 'pusher-platform';
import PresencePayload from './presence_payload';
import User from './user';
import UserStoreCore from './user_store_core';
export interface GlobalUserStoreOptions {
    apiInstance: Instance;
    userStoreCore?: UserStoreCore;
}
export default class GlobalUserStore {
    private apiInstance;
    private userStoreCore;
    constructor(options: GlobalUserStoreOptions);
    addOrMerge(user: User): User;
    remove(id: string): User | undefined;
    user(id: string, onSuccess: (user: User) => void, onError: (error: any) => void): void;
    findOrGetUser(id: string, onSuccess: (user: User) => void, onError: (error: any) => void): void;
    getUser(id: string, onSuccess: (user: User) => void, onError: (error: any) => void): void;
    handleInitialPresencePayloadsAfterRoomJoin(payloads: PresencePayload[], onComplete: () => void): void;
    handleInitialPresencePayloads(payloads: PresencePayload[], onComplete: () => void): void;
    fetchUsersWithIds(userIds: string[], onSuccess: (users: User[]) => void, onError: (error: Error) => void): void;
    initialFetchOfUsersWithIds(userIds: string[], onSuccess: (users: User[]) => void, onError: (error: Error) => void): void;
}

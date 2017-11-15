import { Instance } from 'pusher-platform';
import PresencePayload from './presence_payload';
import User from './user';
import UserStoreCore from './user_store_core';
export interface GlobalUserStoreOptions {
    instance: Instance;
    userStoreCore?: UserStoreCore;
}
export default class GlobalUserStore {
    private instance;
    private userStoreCore;
    constructor(options: GlobalUserStoreOptions);
    addOrMerge(user: User): User;
    remove(id: string): User | undefined;
    user(id: string, onSuccess: (User) => void, onError: (Error) => void): void;
    findOrGetUser(id: string, onSuccess: (User) => void, onError: (Error) => void): void;
    getUser(id: string, onSuccess: (User) => void, onError: (Error) => void): void;
    handleInitialPresencePayloadsAfterRoomJoin(payloads: PresencePayload[], onComplete: () => void): void;
    handleInitialPresencePayloads(payloads: PresencePayload[], onComplete: () => void): void;
    fetchUsersWithIds(userIds: string[], onSuccess: (users: User[]) => void, onError: (error: Error) => void): void;
    initialFetchOfUsersWithIds(userIds: string[], onSuccess: (users: User[]) => void, onError: (error: Error) => void): void;
}

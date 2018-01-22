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
    user(id: string): Promise<User>;
    getUser(id: string): Promise<User>;
    handleInitialPresencePayloads(payloads: PresencePayload[]): Promise<void>;
    fetchUsersWithIds(userIds: string[]): Promise<User[]>;
}

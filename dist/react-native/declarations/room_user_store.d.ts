import User from './user';
import UserStoreCore from './user_store_core';
export default class RoomUserStore {
    private userStoreCore;
    constructor(userStoreCore?: UserStoreCore);
    addOrMerge(user: User): User;
    remove(id: string): User | undefined;
}

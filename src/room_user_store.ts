import User from './user';
import UserStoreCore from './user_store_core';

export default class RoomUserStore {
  private userStoreCore: UserStoreCore;

  constructor(userStoreCore = new UserStoreCore()) {
    this.userStoreCore = userStoreCore;
  }

  addOrMerge(user: User): User {
    return this.userStoreCore.addOrMerge(user);
  }

  remove(id: string): User | undefined {
    return this.userStoreCore.remove(id);
  }
}

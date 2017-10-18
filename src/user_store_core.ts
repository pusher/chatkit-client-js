import User from './user';

export default class UserStoreCore {
  private users: User[];

  constructor(users = new Array<User>()) {
    this.users = users;
  }

  addOrMerge(user: User): User {
    const existingUser = this.users.find(el => el.id === user.id);

    if (existingUser) {
      existingUser.updateWithPropertiesOfUser(user);
      return existingUser;
    } else {
      this.users.push(user);
      return user;
    }
  }

  remove(id: string): User | undefined {
    const indexOfUser = this.users.findIndex(el => el.id === id);
    if (indexOfUser === -1) {
      return undefined;
    }

    const user = this.users[indexOfUser];
    this.users.splice(indexOfUser, 1);
    return user;
  }

  find(id: string): User | undefined {
    return this.users.find(el => el.id === id);
  }
}

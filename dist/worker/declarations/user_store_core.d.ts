import User from './user';
export default class UserStoreCore {
    private users;
    constructor(users?: User[]);
    addOrMerge(user: User): User;
    remove(id: string): User | undefined;
    find(id: string): User | undefined;
}

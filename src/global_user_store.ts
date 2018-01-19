import { Instance } from 'pusher-platform';

import PayloadDeserializer from './payload_deserializer';
import PresencePayload from './presence_payload';
import User from './user';
import UserStoreCore from './user_store_core';

import { allPromisesSettled, queryString } from './utils';

export interface GlobalUserStoreOptions {
  apiInstance: Instance;
  userStoreCore?: UserStoreCore;
}

export default class GlobalUserStore {
  private apiInstance: Instance;
  private userStoreCore: UserStoreCore;

  constructor(options: GlobalUserStoreOptions) {
    this.apiInstance = options.apiInstance;
    this.userStoreCore = options.userStoreCore || new UserStoreCore();
  }

  addOrMerge(user: User): User {
    return this.userStoreCore.addOrMerge(user);
  }

  remove(id: string): User | undefined {
    return this.userStoreCore.remove(id);
  }

  user(
    id: string,
    onSuccess: (user: User) => void,
    onError: (error: any) => void,
  ) {
    this.findOrGetUser(id, onSuccess, onError);
  }

  findOrGetUser(
    id: string,
    onSuccess: (user: User) => void,
    onError: (error: any) => void,
  ) {
    const user = this.userStoreCore.find(id);
    if (user) {
      onSuccess(user);
      return;
    }

    this.getUser(id, onSuccess, onError);
  }

  getUser(
    id: string,
    onSuccess: (user: User) => void,
    onError: (error: any) => void,
  ) {
    this.apiInstance
      .request({
        method: 'GET',
        path: `/users/${id}`,
      })
      .then((res: any) => {
        const userPayload = JSON.parse(res);
        const user = PayloadDeserializer.createUserFromPayload(userPayload);
        const userToReturn = this.addOrMerge(user);
        onSuccess(userToReturn);
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(
          'Error fetching user information:',
          error,
        );
        onError(error);
      });
  }

  handleInitialPresencePayloadsAfterRoomJoin(
    payloads: PresencePayload[],
    onComplete: () => void,
  ) {
    this.handleInitialPresencePayloads(payloads, onComplete);
  }

  handleInitialPresencePayloads(
    payloads: PresencePayload[],
    onComplete: () => void,
  ) {
    const presencePayloadPromises = new Array<Promise<any>>();

    payloads.forEach(payload => {
      const presencePromise = new Promise<any>((resolve, reject) => {
        this.user(
          payload.userId,
          user => {
            user.updatePresenceInfoIfAppropriate(payload);
            resolve();
          },
          error => {
            this.apiInstance.logger.verbose(
              'Error fetching user information:',
              error,
            );
            reject();
          },
        );
      });

      presencePayloadPromises.push(presencePromise);
    });

    allPromisesSettled(presencePayloadPromises).then(() => {
      onComplete();
    });
  }

  // TODO: Need a version of this that first checks the userStore for any of the userIds
  // provided and then only makes a request to fetch the user information for the userIds
  // that aren't known about. This would be used in the creatRoom callback and the
  // addedToRoom parsing function
  async fetchUsersWithIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) {
      this.apiInstance.logger.verbose(
        'Requested to fetch users for a list of user ids which was empty',
      );
      return [];
    }

    const userIdsString = userIds.join(',');
    const qs = queryString({ user_ids: userIdsString });

    try {
      const res = await this.apiInstance.request({
        method: 'GET',
        path: `/users_by_ids${qs}`,
      });
      const usersPayload = JSON.parse(res);

      // TODO: Make it more like flatMap, or handle errors being thrown?
      return usersPayload.map((userPayload: any) => {
        const user = PayloadDeserializer.createUserFromPayload(userPayload);
        const addedOrUpdatedUser = this.userStoreCore.addOrMerge(user);
        return addedOrUpdatedUser;
      });
    } catch (err) {
      this.apiInstance.logger.verbose('Error fetching user information:', err);
      throw err;
    }
  }

  initialFetchOfUsersWithIds(
    userIds: string[],
    onSuccess: (users: User[]) => void,
    onError: (error: Error) => void,
  ) {
    this.fetchUsersWithIds(userIds)
      .then(onSuccess)
      .catch(onError);
  }
}

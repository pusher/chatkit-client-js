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

  async user(id: string): Promise<User> {
    const user = this.userStoreCore.find(id);
    if (user) {
      return user;
    }
    return await this.getUser(id);
  }

  async getUser(id: string): Promise<User> {
    try {
      const res = await this.apiInstance.request({
        method: 'GET',
        path: `/users/${id}`,
      });
      const userPayload = JSON.parse(res);
      const user = PayloadDeserializer.createUserFromPayload(userPayload);
      return this.addOrMerge(user);
    } catch (err) {
      this.apiInstance.logger.verbose('Error fetching user information:', err);
      throw err;
    }
  }

  async handleInitialPresencePayloads(
    payloads: PresencePayload[],
  ): Promise<void> {
    const presencePayloadPromises = payloads.map(payload => {
      return this.user(payload.userId)
        .then(user => {
          user.updatePresenceInfoIfAppropriate(payload);
        })
        .catch(err => {
          this.apiInstance.logger.verbose(
            'Error fetching user information:',
            err,
          );
          throw err;
        });
    });
    await allPromisesSettled(presencePayloadPromises);
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
}

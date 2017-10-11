import {
  Instance
} from 'pusher-platform';

import User from './user';
import UserStoreCore from './user_store_core';
import PayloadDeserializer from './payload_deserializer';
import { queryString } from './utils';


export interface GlobalUserStoreOptions {
  instance: Instance;
  userStoreCore?: UserStoreCore;
}

export default class GlobalUserStore {
  private instance: Instance;
  private userStoreCore: UserStoreCore;

  constructor(options: GlobalUserStoreOptions) {
    this.instance = options.instance;
    this.userStoreCore = options.userStoreCore || new UserStoreCore();
  }

  addOrMerge(user: User): User {
    return this.userStoreCore.addOrMerge(user);
  }

  remove(id: string): User | undefined {
    return this.userStoreCore.remove(id);
  }

  user(id: string, onSuccess: (User) => void, onError: (Error) => void) {
    this.findOrGetUser(id, onSuccess, onError)
  }

  findOrGetUser(id: string, onSuccess: (User) => void, onError: (Error) => void) {
    const user = this.userStoreCore.find(id);
    if (user) {
      onSuccess(user);
      return;
    }

    this.getUser(id, onSuccess, onError);
  }

  getUser(id: string, onSuccess: (User) => void, onError: (Error) => void) {
    this.instance.request({
      method: "GET",
      path: `/users/${id}`,
    }).then(res => {
      const userPayload = JSON.parse(res);
      const user = PayloadDeserializer.createUserFromPayload(userPayload);
      const userToReturn = this.addOrMerge(user);
      onSuccess(userToReturn);
    }).catch(err => {
      // TODO: Proper error handling
      onError(err);
      console.log("Error", err)
    })
  }

  // func handleInitialPresencePayloadsAfterRoomJoin(_ payloads: [PCPresencePayload], completionHandler: @escaping () -> Void) {
  //     let roomJoinedPresenceProgressCounter = PCProgressCounter(totalCount: payloads.count, labelSuffix: "room-joined-presence-payload")
  //     self.handleInitialPresencePayloads(payloads, progressCounter: roomJoinedPresenceProgressCounter, completionHandler: completionHandler)
  // }

  // func handleInitialPresencePayloads(_ payloads: [PCPresencePayload], completionHandler: @escaping () -> Void) {
  //     let initialPresenceProgressCounter = PCProgressCounter(totalCount: payloads.count, labelSuffix: "initial-presence-payload")
  //     self.handleInitialPresencePayloads(payloads, progressCounter: initialPresenceProgressCounter, completionHandler: completionHandler)
  // }

  // private func handleInitialPresencePayloads(_ payloads: [PCPresencePayload], progressCounter: PCProgressCounter, completionHandler: @escaping () -> Void) {
  //     let presenceProgressCounter = progressCounter

  //     payloads.forEach { payload in
  //         self.user(id: payload.userId) { [weak self] user, err in
  //             guard let strongSelf = self else {
  //                 print("self is nil when user store returns user when handling intitial presence payload event")
  //                 return
  //             }

  //             guard let user = user, err == nil else {
  //                 strongSelf.instance.logger.log(err!.localizedDescription, logLevel: .error)
  //                 if presenceProgressCounter.incrementFailedAndCheckIfFinished() {
  //                     completionHandler()
  //                 }

  //                 return
  //             }

  //             user.updatePresenceInfoIfAppropriate(newInfoPayload: payload)

  //             if presenceProgressCounter.incrementSuccessAndCheckIfFinished() {
  //                 completionHandler()
  //             }
  //         }
  //     }
  // }

  // TODO: Need a version of this that first checks the userStore for any of the userIds
  // provided and then only makes a request to fetch the user information for the userIds
  // that aren't known about. This would be used in the creatRoom callback and the
  // addedToRoom parsing function

  // This will do the de-duping of userIds

  fetchUsersWithIds(userIds: Set<string>, onSuccess: (users: User[]) => void, onError: (error: Error) => void) {
    if (userIds.size === 0) {
      // this.instance.logger.log("Requested to fetch users for a list of user ids which was empty", logLevel: .debug);
      onSuccess([]);
      return
    }

    const userIdsString = Array.from(userIds.values()).join(',');
    const qs = queryString({ user_ids: userIdsString });

    this.instance.request({
      method: "GET",
      path: `/users_by_ids${qs}`,
    }).then(res => {
      const usersPayload = JSON.parse(res);

      const users = usersPayload.map(userPayload => {
        const user = PayloadDeserializer.createUserFromPayload(userPayload);
        const addedOrUpdatedUser = this.userStoreCore.addOrMerge(user);
        return addedOrUpdatedUser;
      })

      onSuccess(users);
    }).catch(err => {
      // TODO: Proper error handling
      onError(err);
      console.log("Error", err)
    })
  }

  initialFetchOfUsersWithIds(userIds: Set<string>, onSuccess: (users: User[]) => void, onError: (error: Error) => void) {
    this.fetchUsersWithIds(userIds, onSuccess, onError);
  }
}

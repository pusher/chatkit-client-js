import {
  Instance
} from 'pusher-platform';

import User from './user';
import UserStoreCore from './user_store_core';


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
    // if let user = self.userStoreCore.users.first(where: { $0.id == id }) {
    //         completionHandler(user, nil)
    //     } else {
    //         self.getUser(id: id) { [weak self] user, err in
    //             guard let strongSelf = self else {
    //                 print("self is nil getUser completes in the user store")
    //                 return
    //             }

    //             guard let user = user, err == nil else {
    //                 strongSelf.instance.logger.log(err!.localizedDescription, logLevel: .error)
    //                 completionHandler(nil, err!)
    //                 return
    //             }

    //             let userToReturn = strongSelf.userStoreCore.addOrMerge(user)
    //             completionHandler(userToReturn, nil)
    //         }
    //     }
  }

  // func getUser(id: String, completionHandler: @escaping (PCUser?, Error?) -> Void) {
  //     let path = "/users/\(id)"
  //     let generalRequest = PPRequestOptions(method: HTTPMethod.GET.rawValue, path: path)

  //     self.instance.requestWithRetry(
  //         using: generalRequest,
  //         onSuccess: { data in
  //             guard let jsonObject = try? JSONSerialization.jsonObject(with: data, options: []) else {
  //                 completionHandler(nil, PCError.failedToDeserializeJSON(data))
  //                 return
  //             }

  //             guard let userPayload = jsonObject as? [String: Any] else {
  //                 completionHandler(nil, PCError.failedToCastJSONObjectToDictionary(jsonObject))
  //                 return
  //             }

  //             do {
  //                 let user = try PCPayloadDeserializer.createUserFromPayload(userPayload)
  //                 completionHandler(user, nil)
  //             } catch let err {
  //                 self.instance.logger.log(err.localizedDescription, logLevel: .debug)
  //                 completionHandler(nil, err)
  //                 return
  //             }
  //         },
  //         onError: { err in
  //             completionHandler(nil, err)
  //         }
  //     )
  // }

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

  // // TODO: Need a version of this that first checks the userStore for any of the userIds
  // // provided and then only makes a request to fetch the user information for the userIds
  // // that aren't known about. This would be used in the creatRoom callback and the
  // // addedToRoom parsing function

  // // This will do the de-duping of userIds
  // func fetchUsersWithIds(_ userIds: Set<String>, completionHandler: (([PCUser]?, Error?) -> Void)? = nil) {
  //     guard userIds.count > 0 else {
  //         self.instance.logger.log("Requested to fetch users for a list of user ids which was empty", logLevel: .debug)
  //         completionHandler?([], nil)
  //         return
  //     }

  //     let userIdsString = userIds.joined(separator: ",")

  //     let path = "/users_by_ids"
  //     let generalRequest = PPRequestOptions(method: HTTPMethod.GET.rawValue, path: path)
  //     generalRequest.addQueryItems([URLQueryItem(name: "user_ids", value: userIdsString)])

  //     // We want this to complete quickly, whether it succeeds or not
  //     generalRequest.retryStrategy = PPDefaultRetryStrategy(maxNumberOfAttempts: 1)

  //     self.instance.requestWithRetry(
  //         using: generalRequest,
  //         onSuccess: { data in
  //             guard let jsonObject = try? JSONSerialization.jsonObject(with: data, options: []) else {
  //                 let err = PCError.failedToDeserializeJSON(data)
  //                 self.instance.logger.log(
  //                     "Error fetching user information: \(err.localizedDescription)",
  //                     logLevel: .debug
  //                 )
  //                 completionHandler?(nil, err)
  //                 return
  //             }

  //             guard let userPayloads = jsonObject as? [[String: Any]] else {
  //                 let err = PCError.failedToCastJSONObjectToDictionary(jsonObject)
  //                 self.instance.logger.log(
  //                     "Error fetching user information: \(err.localizedDescription)",
  //                     logLevel: .debug
  //                 )
  //                 completionHandler?(nil, err)
  //                 return
  //             }

  //             let users = userPayloads.flatMap { userPayload -> PCUser? in
  //                 do {
  //                     let user = try PCPayloadDeserializer.createUserFromPayload(userPayload)
  //                     let addedOrUpdatedUser = self.userStoreCore.addOrMerge(user)
  //                     return addedOrUpdatedUser
  //                 } catch let err {
  //                     self.instance.logger.log("Error fetching user information: \(err.localizedDescription)", logLevel: .debug)
  //                     return nil
  //                 }
  //             }
  //             completionHandler?(users, nil)
  //         },
  //         onError: { err in
  //             self.instance.logger.log("Error fetching user information: \(err.localizedDescription)", logLevel: .debug)
  //         }
  //     )
  // }

  // func initialFetchOfUsersWithIds(_ userIds: Set<String>, completionHandler: (([PCUser]?, Error?) -> Void)? = nil) {
  //     self.fetchUsersWithIds(userIds, completionHandler: completionHandler)
  // }
}

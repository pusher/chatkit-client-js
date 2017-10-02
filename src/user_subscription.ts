import {
  Instance,
  SubscriptionEvent,
} from 'pusher-platform';

import GlobalUserStore from './global_user_store';
import CurrentUser from './current_user';
import ChatManagerDelegate from './chat_manager_delegate';


export type ElementsHeaders = {
  [key: string]: string;
}

export interface UserSubscriptionOptions {
  instance: Instance;
  userStore: GlobalUserStore;
  delegate?: ChatManagerDelegate;
  connectCompletionHandler: (currentUser?: CurrentUser, error?: any) => void;
}

export default class UserSubscription {
  private instance: Instance;

  // resumingSubscription: ResumingSubscription;
  userStore: GlobalUserStore;
  delegate: ChatManagerDelegate;
  connectCompletionHandlers: [(CurrentUser?, Error?) => void];
  currentUser?: CurrentUser;

  constructor(options: UserSubscriptionOptions) {
    this.instance = options.instance;
    this.userStore = options.userStore;
    this.delegate = options.delegate;
    this.connectCompletionHandlers = [options.connectCompletionHandler];
  }

  handleEvent(event: SubscriptionEvent) {
    console.log("Handling event: ", event);

    // guard let json = data as? [String: Any] else {
    //     self.instance.logger.log("Failed to cast JSON object to Dictionary: \(data)", logLevel: .debug)
    //     return
    // }

    // guard let eventNameString = json["event_name"] as? String else {
    //     self.instance.logger.log("Event name missing for API event: \(json)", logLevel: .debug)
    //     return
    // }

    // // TODO: Decide if we even need this in the client
    // //        guard let timestamp = json["timestamp"] as? String else {
    // //            return
    // //        }
    // guard let eventName = PCAPIEventName(rawValue: eventNameString) else {
    //     self.instance.logger.log("Unsupported API event name received: \(eventNameString)", logLevel: .debug)
    //     return
    // }

    // guard let apiEventData = json["data"] as? [String: Any] else {
    //     self.instance.logger.log("Data missing for API event: \(json)", logLevel: .debug)
    //     return
    // }

    // let userId = json["user_id"] as? String

    // self.instance.logger.log("Received event name: \(eventNameString), and data: \(apiEventData)", logLevel: .verbose)

    // switch eventName {
    // case .initial_state:
    //     parseInitialStatePayload(eventName, data: apiEventData, userStore: self.userStore)
    // case .added_to_room:
    //     parseAddedToRoomPayload(eventName, data: apiEventData)
    // case .removed_from_room:
    //     parseRemovedFromRoomPayload(eventName, data: apiEventData)
    // case .room_updated:
    //     parseRoomUpdatedPayload(eventName, data: apiEventData)
    // case .room_deleted:
    //     parseRoomDeletedPayload(eventName, data: apiEventData)
    // case .user_joined:
    //     parseUserJoinedPayload(eventName, data: apiEventData)
    // case .user_left:
    //     parseUserLeftPayload(eventName, data: apiEventData)
    // case .typing_start:
    //     parseTypingStartPayload(eventName, data: apiEventData, userId: userId!)
    // case .typing_stop:
    //     parseTypingStopPayload(eventName, data: apiEventData, userId: userId!)
    // }
  }

  // fileprivate func callConnectCompletionHandlers(currentUser: PCCurrentUser?, error: Error?) {
  //   for connectCompletionHandler in self.connectCompletionHandlers {
  //     connectCompletionHandler(currentUser, error)
  //   }
  // }

  // fileprivate func parseInitialStatePayload(_ eventName: PCAPIEventName, data: [String: Any], userStore: PCGlobalUserStore) {
  //   guard let roomsPayload = data["rooms"] as? [[String: Any]] else {
  //       callConnectCompletionHandlers(
  //           currentUser: nil,
  //           error: PCAPIEventError.keyNotPresentInEventPayload(
  //               key: "rooms",
  //               apiEventName: eventName,
  //               payload: data
  //           )
  //       )
  //       return
  //   }

  //   guard let userPayload = data["current_user"] as? [String: Any] else {
  //       callConnectCompletionHandlers(
  //           currentUser: nil,
  //           error: PCAPIEventError.keyNotPresentInEventPayload(
  //               key: "user",
  //               apiEventName: eventName,
  //               payload: data
  //           )
  //       )
  //       return
  //   }

  //   let receivedCurrentUser: PCCurrentUser

  //   do {
  //       receivedCurrentUser = try PCPayloadDeserializer.createCurrentUserFromPayload(userPayload, instance: self.instance, userStore: userStore)
  //   } catch let err {
  //       callConnectCompletionHandlers(
  //           currentUser: nil,
  //           error: err
  //       )
  //       return
  //   }

  //   let wasExistingCurrentUser = self.currentUser != nil

  //   // If the currentUser property is already set then the assumption is that there was
  //   // already a user subscription and so instead of setting the property to a new
  //   // PCCurrentUser, we update the existing one to have the most up-to-date state
  //   if let currentUser = self.currentUser {
  //       currentUser.updateWithPropertiesOf(receivedCurrentUser)
  //   } else {
  //       self.currentUser = receivedCurrentUser
  //   }

  //   // If a presenceSubscription already exists then we want to create a new one
  //   // to ensure that the most up-to-date state is received, so we first close the
  //   // existing subscription, if it was still open
  //   if let presSub = self.currentUser?.presenceSubscription {
  //       presSub.end()
  //       self.currentUser!.presenceSubscription = nil
  //   }

  //   guard roomsPayload.count > 0 else {
  //       self.callConnectCompletionHandlers(currentUser: self.currentUser, error: nil)
  //       self.currentUser!.setupPresenceSubscription(delegate: self.delegate)
  //       return
  //   }

  //   let roomsAddedToRoomStoreProgressCounter = PCProgressCounter(
  //       totalCount: roomsPayload.count,
  //       labelSuffix: "roomstore-room-append"
  //   )

  //   var combinedRoomUserIds = Set<String>()
  //   var roomsFromConnection = [PCRoom]()

  //   roomsPayload.forEach { roomPayload in
  //       do {
  //           let room = try PCPayloadDeserializer.createRoomFromPayload(roomPayload)

  //           combinedRoomUserIds.formUnion(room.userIds)
  //           roomsFromConnection.append(room)

  //           self.currentUser!.roomStore.addOrMerge(room) { _ in
  //               if roomsAddedToRoomStoreProgressCounter.incrementSuccessAndCheckIfFinished() {
  //                   self.callConnectCompletionHandlers(currentUser: self.currentUser, error: nil)
  //                   self.fetchInitialUserInformationForUserIds(combinedRoomUserIds, currentUser: self.currentUser!)
  //                   if wasExistingCurrentUser {
  //                       self.reconcileExistingRoomStoreWithRoomsReceivedOnConnection(roomsFromConnection: roomsFromConnection)
  //                   }
  //               }
  //           }
  //       } catch let err {
  //           self.instance.logger.log(
  //               "Incomplete room payload in initial_state event: \(roomPayload). Error: \(err.localizedDescription)",
  //               logLevel: .debug
  //           )
  //           if roomsAddedToRoomStoreProgressCounter.incrementFailedAndCheckIfFinished() {
  //               self.callConnectCompletionHandlers(currentUser: self.currentUser, error: nil)
  //               self.fetchInitialUserInformationForUserIds(combinedRoomUserIds, currentUser: self.currentUser!)
  //               if wasExistingCurrentUser {
  //                   self.reconcileExistingRoomStoreWithRoomsReceivedOnConnection(roomsFromConnection: roomsFromConnection)
  //               }
  //           }
  //       }
  //   }
  // }

  // fileprivate func fetchInitialUserInformationForUserIds(_ userIds: Set<String>, currentUser: PCCurrentUser) {
  //     self.userStore.initialFetchOfUsersWithIds(userIds) { _, err in
  //         guard err == nil else {
  //             self.instance.logger.log(
  //                 "Unable to fetch user information after successful connection: \(err!.localizedDescription)",
  //                 logLevel: .debug
  //             )
  //             return
  //         }

  //         let combinedRoomUsersProgressCounter = PCProgressCounter(totalCount: currentUser.roomStore.rooms.count, labelSuffix: "room-users-combined")

  //         // TODO: This could be a lot more efficient
  //         currentUser.roomStore.rooms.forEach { room in
  //             let roomUsersProgressCounter = PCProgressCounter(totalCount: room.userIds.count, labelSuffix: "room-users")

  //             room.userIds.forEach { userId in
  //                 self.userStore.user(id: userId) { [weak self] user, err in
  //                     guard let strongSelf = self else {
  //                         print("self is nil when user store returns user after initial fetch of users")
  //                         return
  //                     }

  //                     guard let user = user, err == nil else {
  //                         strongSelf.instance.logger.log(
  //                             "Unable to add user with id \(userId) to room \(room.name): \(err!.localizedDescription)",
  //                             logLevel: .debug
  //                         )
  //                         if roomUsersProgressCounter.incrementFailedAndCheckIfFinished() {
  //                             room.subscription?.delegate?.usersUpdated()
  //                             strongSelf.instance.logger.log("Users updated in room \(room.name)", logLevel: .verbose)

  //                             if combinedRoomUsersProgressCounter.incrementFailedAndCheckIfFinished() {
  //                                 currentUser.setupPresenceSubscription(delegate: strongSelf.delegate)
  //                             }
  //                         }

  //                         return
  //                     }

  //                     room.userStore.addOrMerge(user)

  //                     if roomUsersProgressCounter.incrementSuccessAndCheckIfFinished() {
  //                         room.subscription?.delegate?.usersUpdated()
  //                         strongSelf.instance.logger.log("Users updated in room \(room.name)", logLevel: .verbose)

  //                         if combinedRoomUsersProgressCounter.incrementSuccessAndCheckIfFinished() {
  //                             currentUser.setupPresenceSubscription(delegate: strongSelf.delegate)
  //                         }
  //                     }
  //                 }
  //             }
  //         }
  //     }
  // }

  // fileprivate func reconcileExistingRoomStoreWithRoomsReceivedOnConnection(roomsFromConnection: [PCRoom]) {
  //     guard let currentUser = self.currentUser else {
  //         self.instance.logger.log("currentUser property not set on PCUserSubscription", logLevel: .error)
  //         self.delegate.error(error: PCError.currentUserIsNil)
  //         return
  //     }

  //     let roomStoreRooms = Set<PCRoom>(currentUser.roomStore.rooms.underlyingArray)
  //     let mostRecentConnectionRooms = Set<PCRoom>(roomsFromConnection)
  //     let noLongerAMemberOfRooms = roomStoreRooms.subtracting(mostRecentConnectionRooms)

  //     noLongerAMemberOfRooms.forEach { room in

  //         // TODO: Not sure if this is the best way of communicating that while the subscription
  //         // was closed there was an event that meant that the current user is no longer a
  //         // member of a given room
  //         self.delegate.removedFromRoom(room: room)
  //     }
  // }
}

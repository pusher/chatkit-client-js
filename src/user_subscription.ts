import {
  Instance,
  SubscriptionEvent,
} from 'pusher-platform';

import ChatManagerDelegate from './chat_manager_delegate';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import PayloadDeserializer from './payload_deserializer';
import Room from './room';
import User from './user';

import { allPromisesSettled } from './utils';


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
    const { body, eventId, headers } = event;
    const { data } = body;
    const eventName = body.event_name;

    console.log('Handling event: ', event)

    // self.instance.logger.log("Received event name: \(eventNameString), and data: \(apiEventData)", logLevel: .verbose)

    switch (eventName) {
      case 'initial_state':
        this.parseInitialStatePayload(eventName, data, this.userStore);
        break;
      case 'added_to_room':
        this.parseAddedToRoomPayload(eventName, data);
        break;
      case 'removed_from_room':
        this.parseRemovedFromRoomPayload(eventName, data);
        break;
      case 'room_updated':
        this.parseRoomUpdatedPayload(eventName, data);
        break;
      case 'room_deleted':
        this.parseRoomDeletedPayload(eventName, data);
        break;
      case 'user_joined':
        this.parseUserJoinedPayload(eventName, data);
        break;
      case 'user_left':
        this.parseUserLeftPayload(eventName, data);
        break;
      case 'typing_start':
        this.parseTypingStartPayload(eventName, data, data.user_id);
        break;
      case 'typing_stop':
        this.parseTypingStopPayload(eventName, data, data.user_id);
        break;
    }
  }

  callConnectCompletionHandlers(currentUser?: CurrentUser, error?: Error) {
    this.connectCompletionHandlers.forEach(completionHandler => {
       completionHandler(currentUser, error);
    })
  }

  parseInitialStatePayload(eventName: string, data: any, userStore: GlobalUserStore) {
    console.log(eventName, data, userStore);

    const roomsPayload = data.rooms;
    const userPayload = data.current_user;

    const receivedCurrentUser = PayloadDeserializer.createCurrentUserFromPayload(
      userPayload,
      this.instance,
      this.userStore
     );

    const wasExistingCurrentUser = this.currentUser !== undefined;

    // If the currentUser property is already set then the assumption is that there was
    // already a user subscription and so instead of setting the property to a new
    // CurrentUser, we update the existing one to have the most up-to-date state
    if (this.currentUser) {
      this.currentUser.updateWithPropertiesOf(receivedCurrentUser)
    } else {
      this.currentUser = receivedCurrentUser;
    }

    console.log(receivedCurrentUser);

    const receivedRoomsConstructor = roomsPayload.constructor;

    if (receivedRoomsConstructor !== Array) {
      throw TypeError("`rooms` key of initial_state payload was of type `${receivedRoomsConstructor}`, expected `Array`")
    }

    if (roomsPayload.length === 0) {
      // TODO: Finish setup e.g. presence sub and call completion handlers
      this.currentUser.setupPresenceSubscription(this.delegate);
    }

    var combinedRoomUserIds = new Set<string>([]);
    var roomsFromConnection: Room[] = [];

    roomsPayload.forEach(roomPayload => {
      const room = PayloadDeserializer.createRoomFromPayload(roomPayload);

      room.userIds.forEach(userId => {
        combinedRoomUserIds.add(userId);
      });
      roomsFromConnection.push(room);

      this.currentUser.roomStore.addOrMerge(room)
    })

    this.callConnectCompletionHandlers(this.currentUser);
    this.fetchInitialUserInformationForUserIds(combinedRoomUserIds, this.currentUser);

    if (wasExistingCurrentUser) {
      this.reconcileExistingRoomStoreWithRoomsReceivedOnConnection(roomsFromConnection);
    }
  }

  fetchInitialUserInformationForUserIds(userIds: Set<string>, currentUser: CurrentUser) {
    console.log("fetchInitialUserInformationForUserIds", userIds);
    const userIdsArray: string[] = Array.from(userIds.values());

    this.userStore.initialFetchOfUsersWithIds(
      userIdsArray,
      (users) => {
        const combinedRoomUsersPromises = new Array<Promise<any>>();

        this.currentUser.roomStore.rooms.forEach(room => {
          const roomPromise = new Promise<any>((roomResolve, roomReject) => {
            const roomUsersPromises = new Array<Promise<any>>();

            room.userIds.forEach(userId => {
              const userPromise = new Promise<any>((userResolve, userReject) => {
                this.userStore.user(
                  userId,
                  (user) => {
                    // TODO: Do some logging

                    room.userStore.addOrMerge(user);
                    userResolve();
                  },
                  (error) => {
                    // TODO: Do some logging
                    userReject();
                  }
                )
              });
              roomUsersPromises.push(userPromise);
            });

            // TODO: When all room user promises done:

            allPromisesSettled(roomUsersPromises).then(() => {
              console.log("All promises settled for fetching room users");
              // room.subscription?.delegate?.usersUpdated();
              // strongSelf.instance.logger.log("Users updated in room \(room.name)", logLevel: .verbose)
              roomResolve();
            })
          });

          combinedRoomUsersPromises.push(roomPromise);
        });

        // TODO: When all promises done:

        allPromisesSettled(combinedRoomUsersPromises).then(() => {
          console.log("All promises settled for fetching ALLLLLLLL room users");

          this.currentUser.setupPresenceSubscription(this.delegate);
          // strongSelf.instance.logger.log("Users updated in room \(room.name)", logLevel: .verbose)
        })
      },
      (error) => {
        // TODO: Error handling and logging
        console.log("Error");
        // this.instance.logger.log(
        //   `Unable to fetch user information after successful connection: ${error}`,
        //   logLevel: .debug
        // )
        return
      }
    )
  }

  reconcileExistingRoomStoreWithRoomsReceivedOnConnection(roomsFromConnection: Room[]) {
    console.log("reconcileExistingRoomStoreWithRoomsReceivedOnConnection", roomsFromConnection);
    if (!this.currentUser) {
      // TODO: Some logging, maybe error
      return;
    }

    const roomStoreRooms = this.currentUser.roomStore.rooms;
    const mostRecentConnectionRoomsSet = new Set<Room>(roomsFromConnection);

    const noLongerAMemberOfRooms = roomStoreRooms.filter(room => !mostRecentConnectionRoomsSet.has(room));

    noLongerAMemberOfRooms.forEach(room => {
      // TODO: Not sure if this is the best way of communicating that while the subscription
      // was closed there was an event that meant that the current user is no longer a
      // member of a given room

      // TODO: Finish implementation
      // self.delegate.removedFromRoom(room: room)
    });
  }

  parseAddedToRoomPayload(eventName: string, data: any) {
    // TODO: Delegate stuff

    const roomPayload = data.room;

    if (roomPayload === undefined || (typeof roomPayload) !== 'object') {
      console.log("Room payload undefined or not an object", roomPayload);
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
    const roomAdded = this.currentUser.roomStore.addOrMerge(room);

    // self.delegate.addedToRoom(room: room)
    // self.instance.logger.log("Added to room: \(room.name)", logLevel: .verbose)

    roomAdded.userIds.forEach

    const roomUsersPromises = new Array<Promise<any>>();

    roomAdded.userIds.forEach(userId => {
      const userPromise = new Promise<any>((resolve, reject) => {
        this.userStore.user(
          userId,
          (user) => {
            // TODO: Do some logging

            room.userStore.addOrMerge(user);
            resolve();
          },
          (error) => {
            // TODO: Do some logging
            reject();
          }
        )
      });
      roomUsersPromises.push(userPromise);
    });

    // TODO: When all room user promises done:

    allPromisesSettled(roomUsersPromises).then(() => {
      console.log("All promises settled for fetching room users after addedToRoom");
      // room.subscription?.delegate?.usersUpdated();
      // strongSelf.instance.logger.log("Users updated in room \(room.name)", logLevel: .verbose)
    })
  }

  parseRemovedFromRoomPayload(eventName: string, data: any) {
    // TODO: Delegate stuff

    const roomId = data.room_id;

    if (roomId === undefined || (typeof roomId) !== 'number') {
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    const roomRemoved = this.currentUser.roomStore.remove(roomId);

    if (roomRemoved) {
      // self.delegate.removedFromRoom(room: roomRemovedFrom)
      // self.instance.logger.log("Removed from room: \(roomRemovedFrom.name)", logLevel: .verbose)
    } else {
      // self.instance.logger.log("Received \(eventName.rawValue) API event but room \(roomId) not found in local store of joined rooms", logLevel: .debug)
      return
    }
  }

  parseRoomUpdatedPayload(eventName: string, data: any) {
    const roomPayload = data.room;

    if (roomPayload === undefined || (typeof roomPayload) !== 'object') {
      console.log("Room payload undefined or not an object", roomPayload);
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    const room = PayloadDeserializer.createRoomFromPayload(roomPayload);

    this.currentUser.roomStore.room(
      room.id,
      (roomToUpdate) => {
        console.log("New room stuff is ", room, "and roomToUpdate is: ", roomToUpdate);
        roomToUpdate.updateWithPropertiesOfRoom(room);

        console.log("roomToUpdate is now", roomToUpdate);

        // self.delegate.roomUpdated(room: roomToUpdate)
        // self.instance.logger.log("Room updated: \(room.name)", logLevel: .verbose)
      },
      (error) => {
        // TODO: logging
      }
    )
  }

  parseRoomDeletedPayload(eventName: string, data: any) {
    const roomId = data.room_id;

    if (roomId === undefined || (typeof roomId) !== 'number') {
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    const deletedRoom = this.currentUser.roomStore.remove(roomId);

    if (deletedRoom) {
      // self.delegate.roomDeleted(room: deletedRoom)
      // self.instance.logger.log("Room deleted: \(deletedRoom.name)", logLevel: .verbose)
    } else {
      // self.instance.logger.log("Room \(roomId) was deleted but was not found in local store of joined rooms", logLevel: .debug)
      return;
    }
  }

  parseUserJoinedPayload(eventName: string, data: any) {
    const roomId = data.room_id;

    if (roomId === undefined || (typeof roomId) !== 'number') {
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    const userId = data.user_id;

    if (userId === undefined || (typeof userId) !== 'string') {
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    this.currentUser.roomStore.room(
      roomId,
      (room) => {
        this.currentUser.userStore.user(
          userId,
          (user) => {
            const addedOrMergedUser = room.userStore.addOrMerge(user);
            if (room.userIds.indexOf(addedOrMergedUser.id) === -1) {
              room.userIds.push(addedOrMergedUser.id);
              console.log("addedOrMergedUser.id", addedOrMergedUser.id, "joined ", room.name);
            }

      //         strongSelf.delegate.userJoinedRoom(room: room, user: addedOrMergedUser)
      //         room.subscription?.delegate?.userJoined(user: addedOrMergedUser)
      //         strongSelf.instance.logger.log("User \(user.displayName) joined room: \(room.name)", logLevel: .verbose)
          },
          (error) => {
            // strongSelf.instance.logger.log(
            //   "User with id \(userId) joined room with id \(roomId) but no information about the user could be retrieved. Error was: \(err!.localizedDescription)",
            //   logLevel: .error
            // )
            // strongSelf.delegate.error(error: err!)
            return;
          }
        )


      },
      (error) => {
        // TODO: logging

        // self.instance.logger.log(
        //   "User with id \(userId) joined room with id \(roomId) but no information about the room could be retrieved. Error was: \(err!.localizedDescription)",
        //   logLevel: .error
        // )
        // self.delegate.error(error: err!)
        return;
      }
    )
  }

  parseUserLeftPayload(eventName: string, data: any) {
    const roomId = data.room_id;

    if (roomId === undefined || (typeof roomId) !== 'number') {
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    const userId = data.user_id;

    if (userId === undefined || (typeof userId) !== 'string') {
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    this.currentUser.roomStore.room(
      roomId,
      (room) => {
        this.currentUser.userStore.user(
          userId,
          (user) => {
            const roomUserIdIndex = room.userIds.indexOf(user.id);

            if (roomUserIdIndex > -1) {
              room.userIds.splice(roomUserIdIndex, 1);
              console.log("user", user.id, "left ", room.name);
            }

            room.userStore.remove(user.id);

            // strongSelf.delegate.userLeftRoom(room: room, user: user)
            // room.subscription?.delegate?.userLeft(user: user)
            // strongSelf.instance.logger.log("User \(user.displayName) left room: \(room.name)", logLevel: .verbose)
          },
          (error) => {
            // strongSelf.instance.logger.log(
            //   "User with id \(userId) left room with id \(roomId) but no information about the user could be retrieved. Error was: \(err!.localizedDescription)",
            //   logLevel: .error
            // )
            // strongSelf.delegate.error(error: err!)
            return;
          }
        )


      },
      (error) => {
        // TODO: logging

        // self.instance.logger.log(
        //   "User with id \(userId) joined room with id \(roomId) but no information about the room could be retrieved. Error was: \(err!.localizedDescription)",
        //   logLevel: .error
        // )
        // self.delegate.error(error: err!)
        return;
      }
    )
  }

  parseTypingStartPayload(eventName: string, data: any, userId: string) {
    const roomId = data.room_id;

    if (roomId === undefined || (typeof roomId) !== 'number') {
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    this.currentUser.roomStore.room(
      roomId,
      (room) => {
        this.currentUser.userStore.user(
          userId,
          (user) => {
            console.log("User ", user.id, " started typing in room ", room.name);
            // strongSelf.delegate.userStartedTyping(room: room, user: user)
            // room.subscription?.delegate?.userStartedTyping(user: user)
            // strongSelf.instance.logger.log("\(user.displayName) started typing in room \(room.name)", logLevel: .verbose)
          },
          (error) => {
            // strongSelf.instance.logger.log(err!.localizedDescription, logLevel: .error)
            // strongSelf.delegate.error(error: err!)
            return;
          }
        )
      },
      (error) => {
        // self.instance.logger.log(err!.localizedDescription, logLevel: .error)
        // self.delegate.error(error: err!)
        return;
      }
    );
  }

  parseTypingStopPayload(eventName: string, data: any, userId: string) {
    const roomId = data.room_id;

    if (roomId === undefined || (typeof roomId) !== 'number') {
      //         self.delegate.error(
      //             error: PCAPIEventError.keyNotPresentInEventPayload(
      //                 key: "room_id",
      //                 apiEventName: eventName,
      //                 payload: data
      //             )
      //         )
      return;
    }

    this.currentUser.roomStore.room(
      roomId,
      (room) => {
        this.currentUser.userStore.user(
          userId,
          (user) => {
            console.log("User ", user.id, " stopped typing in room ", room.name);

            // strongSelf.delegate.userStoppedTyping(room: room, user: user)
            // room.subscription?.delegate?.userStoppedTyping(user: user)
            // strongSelf.instance.logger.log("\(user.displayName) stopped typing in room \(room.name)", logLevel: .verbose)
          },
          (error) => {
            // strongSelf.instance.logger.log(err!.localizedDescription, logLevel: .error)
            // strongSelf.delegate.error(error: err!)
            return;
          }
        )
      },
      (error) => {
        // self.instance.logger.log(err!.localizedDescription, logLevel: .error)
        // self.delegate.error(error: err!)
        return;
      }
    );
  }
}

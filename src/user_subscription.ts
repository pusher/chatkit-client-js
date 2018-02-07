import { Instance, SubscriptionEvent } from 'pusher-platform';

import ChatManagerDelegate from './chat_manager_delegate';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import PayloadDeserializer from './payload_deserializer';
import Room from './room';
import User from './user';

import { TYPING_REQ_TTL } from './constants';
import { allPromisesSettled } from './utils';

export interface UserSubscriptionOptions {
  apiInstance: Instance;
  filesInstance: Instance;
  cursorsInstance: Instance;
  presenceInstance: Instance;
  userStore: GlobalUserStore;
  delegate?: ChatManagerDelegate;
  connectCompletionHandler: (currentUser?: CurrentUser, error?: any) => void;
}

export default class UserSubscription {
  userStore: GlobalUserStore;
  delegate?: ChatManagerDelegate;
  connectCompletionHandlers: [(currentUser?: CurrentUser, error?: any) => void];
  currentUser?: CurrentUser;

  private apiInstance: Instance;
  private filesInstance: Instance;
  private cursorsInstance: Instance;
  private presenceInstance: Instance;
  private typingTimers: { [roomId: number]: { [userId: string]: number } } = {};

  constructor(options: UserSubscriptionOptions) {
    this.apiInstance = options.apiInstance;
    this.filesInstance = options.filesInstance;
    this.cursorsInstance = options.cursorsInstance;
    this.presenceInstance = options.presenceInstance;
    this.userStore = options.userStore;
    this.delegate = options.delegate;
    this.connectCompletionHandlers = [options.connectCompletionHandler];
  }

  handleEvent(event: SubscriptionEvent) {
    const { body, eventId, headers } = event;
    const { data } = body;
    const eventName = body.event_name;

    this.apiInstance.logger.verbose(
      `Received event name: ${eventName}, and data: ${data}`,
    );

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
      case 'typing_start': // 'is_typing'
        // Treating like an is_typing event for now as an experiment
        this.parseIsTypingPayload(eventName, data, data.user_id);
        break;
      case 'typing_stop':
        // Ignored for now, using typing_start in lieu of is_typing
        // this.parseTypingStopPayload(eventName, data, data.user_id);
        break;
    }
  }

  callConnectCompletionHandlers(currentUser?: CurrentUser, error?: Error) {
    this.connectCompletionHandlers.forEach(completionHandler => {
      completionHandler(currentUser, error);
    });
  }

  parseInitialStatePayload(
    eventName: string,
    data: any,
    userStore: GlobalUserStore,
  ) {
    const roomsPayload = data.rooms;
    const userPayload = data.current_user;

    const receivedCurrentUser = PayloadDeserializer.createCurrentUserFromPayload(
      userPayload,
      this.apiInstance,
      this.filesInstance,
      this.cursorsInstance,
      this.presenceInstance,
      this.userStore,
    );

    const wasExistingCurrentUser = this.currentUser !== undefined;

    // If the currentUser property is already set then the assumption is that there was
    // already a user subscription and so instead of setting the property to a new
    // CurrentUser, we update the existing one to have the most up-to-date state
    if (this.currentUser) {
      this.currentUser.updateWithPropertiesOf(receivedCurrentUser);
    } else {
      this.currentUser = receivedCurrentUser;
    }

    const receivedRoomsConstructor = roomsPayload.constructor;

    if (receivedRoomsConstructor !== Array) {
      throw TypeError(
        '`rooms` key of initial_state payload was of type `${receivedRoomsConstructor}`, expected `Array`',
      );
    }

    if (roomsPayload.length === 0) {
      this.currentUser.setupPresenceSubscription(this.delegate);
      this.callConnectCompletionHandlers(this.currentUser);
      return;
    }

    const combinedRoomUserIds = new Set<string>([]);
    const roomsFromConnection: Room[] = [];

    roomsPayload.forEach((roomPayload: any) => {
      const room = PayloadDeserializer.createRoomFromPayload(roomPayload);

      room.userIds.forEach(userId => {
        combinedRoomUserIds.add(userId);
      });
      roomsFromConnection.push(room);

      if (!this.currentUser) {
        this.apiInstance.logger.verbose(
          'currentUser property not set on UserSubscription',
        );
        return;
      }

      this.currentUser.roomStore.addOrMerge(room);
    });

    this.callConnectCompletionHandlers(this.currentUser);
    this.fetchInitialUserInformationForUserIds(
      combinedRoomUserIds,
      this.currentUser,
    );

    if (wasExistingCurrentUser) {
      this.reconcileExistingRoomStoreWithRoomsReceivedOnConnection(
        roomsFromConnection,
      );
    }
  }

  fetchInitialUserInformationForUserIds(
    userIds: Set<string>,
    currentUser: CurrentUser,
  ) {
    const userIdsArray: string[] = Array.from(userIds.values());

    this.userStore.initialFetchOfUsersWithIds(
      userIdsArray,
      users => {
        const combinedRoomUsersPromises = new Array<Promise<any>>();

        if (!this.currentUser) {
          this.apiInstance.logger.verbose(
            'currentUser property not set on UserSubscription',
          );
          return;
        }

        this.currentUser.roomStore.rooms.forEach(room => {
          const roomPromise = new Promise<any>((roomResolve, roomReject) => {
            const roomUsersPromises = new Array<Promise<any>>();

            room.userIds.forEach(userId => {
              const userPromise = new Promise<any>(
                (userResolve, userReject) => {
                  this.userStore.user(
                    userId,
                    user => {
                      room.userStore.addOrMerge(user);
                      userResolve();
                    },
                    error => {
                      this.apiInstance.logger.verbose(
                        `Unable to fetch information about user ${userId}`,
                      );
                      userReject();
                    },
                  );
                },
              );
              roomUsersPromises.push(userPromise);
            });

            allPromisesSettled(roomUsersPromises).then(() => {
              if (room.subscription === undefined) {
                this.apiInstance.logger.verbose(
                  `Room ${room.name} has no subscription object set`,
                );
              } else {
                if (
                  room.subscription.delegate &&
                  room.subscription.delegate.usersUpdated
                ) {
                  room.subscription.delegate.usersUpdated();
                }
              }

              this.apiInstance.logger.verbose(
                `Users updated in room ${room.name}"`,
              );
              roomResolve();
            });
          });

          combinedRoomUsersPromises.push(roomPromise);
        });

        allPromisesSettled(combinedRoomUsersPromises).then(() => {
          if (!this.currentUser) {
            this.apiInstance.logger.verbose(
              'currentUser property not set on UserSubscription',
            );
            return;
          }

          this.currentUser.setupPresenceSubscription(this.delegate);
        });
      },
      error => {
        this.apiInstance.logger.debug(
          `Unable to fetch user information after successful connection: ${error}`,
        );
        return;
      },
    );
  }

  reconcileExistingRoomStoreWithRoomsReceivedOnConnection(
    roomsFromConnection: Room[],
  ) {
    if (!this.currentUser) {
      this.apiInstance.logger.verbose(
        'currentUser property of UserSubscription unset after successful connection',
      );
      return;
    }

    const roomStoreRooms = this.currentUser.roomStore.rooms;
    const mostRecentConnectionRoomsSet = new Set<Room>(roomsFromConnection);

    const noLongerAMemberOfRooms = roomStoreRooms.filter(
      room => !mostRecentConnectionRoomsSet.has(room),
    );

    noLongerAMemberOfRooms.forEach(room => {
      // TODO: Not sure if this is the best way of communicating that while the subscription
      // was closed there was an event that meant that the current user is no longer a
      // member of a given room

      if (this.delegate && this.delegate.removedFromRoom) {
        this.delegate.removedFromRoom(room);
      }
    });
  }

  parseAddedToRoomPayload(eventName: string, data: any) {
    const roomPayload = data.room;

    if (roomPayload === undefined || typeof roomPayload !== 'object') {
      this.apiInstance.logger.verbose(
        `\`room\` key missing or invalid in \`added_to_room\` payload: ${data}`,
      );
      return;
    }

    if (!this.currentUser) {
      this.apiInstance.logger.verbose(
        'currentUser property not set on UserSubscription',
      );
      return;
    }

    const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
    const roomAdded = this.currentUser.roomStore.addOrMerge(room);

    if (this.delegate && this.delegate.addedToRoom) {
      this.delegate.addedToRoom(room);
    }

    this.apiInstance.logger.verbose(`Added to room: ${room.name}`);

    const roomUsersPromises = new Array<Promise<any>>();

    roomAdded.userIds.forEach(userId => {
      const userPromise = new Promise<any>((resolve, reject) => {
        this.userStore.user(
          userId,
          user => {
            this.apiInstance.logger.verbose(
              `Added user id ${userId} to room ${room.name}`,
            );
            room.userStore.addOrMerge(user);
            resolve();
          },
          error => {
            this.apiInstance.logger.debug(
              `Unable to add user with id ${userId} to room ${
                room.name
              }: ${error}`,
            );
            reject();
          },
        );
      });
      roomUsersPromises.push(userPromise);
    });

    allPromisesSettled(roomUsersPromises).then(() => {
      if (room.subscription === undefined) {
        this.apiInstance.logger.verbose(
          `Room ${room.name} has no subscription object set`,
        );
      } else {
        if (
          room.subscription.delegate &&
          room.subscription.delegate.usersUpdated
        ) {
          room.subscription.delegate.usersUpdated();
        }
      }

      this.apiInstance.logger.verbose(`Users updated in room ${room.name}`);
    });
  }

  parseRemovedFromRoomPayload(eventName: string, data: any) {
    const roomId = data.room_id;

    if (roomId === undefined || typeof roomId !== 'number') {
      this.apiInstance.logger.verbose(
        `\`room_id\` key missing or invalid in \`removed_from_room\` payload: ${data}`,
      );
      return;
    }

    if (!this.currentUser) {
      this.apiInstance.logger.verbose(
        'currentUser property not set on UserSubscription',
      );
      return;
    }

    const roomRemoved = this.currentUser.roomStore.remove(roomId);

    if (roomRemoved) {
      if (this.delegate && this.delegate.removedFromRoom) {
        this.delegate.removedFromRoom(roomRemoved);
      }
      this.apiInstance.logger.verbose(`Removed from room: ${roomRemoved.name}`);
    } else {
      this.apiInstance.logger.verbose(
        `Received \`removed_from_room\` API event but room with ID ${roomId} not found in local store of joined rooms`,
      );
      return;
    }
  }

  parseRoomUpdatedPayload(eventName: string, data: any) {
    const roomPayload = data.room;

    if (roomPayload === undefined || typeof roomPayload !== 'object') {
      this.apiInstance.logger.verbose(
        `\`room\` key missing or invalid in \`room_updated\` payload: ${data}`,
      );
      return;
    }

    if (!this.currentUser) {
      this.apiInstance.logger.verbose(
        'currentUser property not set on UserSubscription',
      );
      return;
    }

    const room = PayloadDeserializer.createRoomFromPayload(roomPayload);

    this.currentUser.roomStore.room(
      room.id,
      roomToUpdate => {
        roomToUpdate.updateWithPropertiesOfRoom(room);

        if (this.delegate && this.delegate.roomUpdated) {
          this.delegate.roomUpdated(roomToUpdate);
        }

        this.apiInstance.logger.verbose(`Room updated: ${room.name}`);
      },
      error => {
        this.apiInstance.logger.debug(`Error updating room ${room.id}:`, error);
      },
    );
  }

  parseRoomDeletedPayload(eventName: string, data: any) {
    const roomId = data.room_id;

    if (roomId === undefined || typeof roomId !== 'number') {
      this.apiInstance.logger.verbose(
        `\`room_id\` key missing or invalid in \`room_deleted\` payload: ${data}`,
      );
      return;
    }

    if (!this.currentUser) {
      this.apiInstance.logger.verbose(
        'currentUser property not set on UserSubscription',
      );
      return;
    }

    const deletedRoom = this.currentUser.roomStore.remove(roomId);

    if (deletedRoom) {
      if (this.delegate && this.delegate.roomDeleted) {
        this.delegate.roomDeleted(deletedRoom);
      }

      this.apiInstance.logger.verbose(`Room deleted: ${deletedRoom.name}`);
    } else {
      this.apiInstance.logger.verbose(
        `Received \`room_deleted\` API event but room with ID ${roomId} not found in local store of joined rooms`,
      );
      return;
    }
  }

  parseUserJoinedPayload(eventName: string, data: any) {
    const roomId = data.room_id;

    if (roomId === undefined || typeof roomId !== 'number') {
      this.apiInstance.logger.verbose(
        `\`room_id\` key missing or invalid in \`user_joined\` payload: ${data}`,
      );
      return;
    }

    const userId = data.user_id;

    if (userId === undefined || typeof userId !== 'string') {
      this.apiInstance.logger.verbose(
        `\`user_id\` key missing or invalid in \`user_joined\` payload: ${data}`,
      );
      return;
    }

    if (!this.currentUser) {
      this.apiInstance.logger.verbose(
        'currentUser property not set on UserSubscription',
      );
      return;
    }

    this.currentUser.roomStore.room(
      roomId,
      room => {
        if (!this.currentUser) {
          this.apiInstance.logger.verbose(
            'currentUser property not set on UserSubscription',
          );
          return;
        }

        this.currentUser.userStore.user(
          userId,
          user => {
            const addedOrMergedUser = room.userStore.addOrMerge(user);
            if (room.userIds.indexOf(addedOrMergedUser.id) === -1) {
              room.userIds.push(addedOrMergedUser.id);
            }

            if (this.delegate && this.delegate.userJoinedRoom) {
              this.delegate.userJoinedRoom(room, addedOrMergedUser);
            }

            if (room.subscription === undefined) {
              this.apiInstance.logger.verbose(
                `Room ${room.name} has no subscription object set`,
              );
            } else {
              if (
                room.subscription.delegate &&
                room.subscription.delegate.userJoined
              ) {
                room.subscription.delegate.userJoined(addedOrMergedUser);
              }
            }

            this.apiInstance.logger.verbose(
              `User ${user.id} joined room: ${room.name}`,
            );
          },
          error => {
            this.apiInstance.logger.verbose(
              `Error fetching user ${userId}:`,
              error,
            );
            // TODO: Delegate question again
            // strongSelf.delegate.error(error: err!)
            return;
          },
        );
      },
      error => {
        this.apiInstance.logger.verbose(
          `User with id ${userId} joined room with id ${roomId} but no information about the room could be retrieved. Error was: ${error}`,
        );
        // self.delegate.error(error: err!)
        return;
      },
    );
  }

  parseUserLeftPayload(eventName: string, data: any) {
    const roomId = data.room_id;

    if (roomId === undefined || typeof roomId !== 'number') {
      this.apiInstance.logger.verbose(
        `\`room_id\` key missing or invalid in \`user_left\` payload: ${data}`,
      );
      return;
    }

    const userId = data.user_id;

    if (userId === undefined || typeof userId !== 'string') {
      this.apiInstance.logger.verbose(
        `\`user_id\` key missing or invalid in \`user_left\` payload: ${data}`,
      );
      return;
    }

    if (!this.currentUser) {
      this.apiInstance.logger.verbose(
        'currentUser property not set on UserSubscription',
      );
      return;
    }

    this.currentUser.roomStore.room(
      roomId,
      room => {
        if (!this.currentUser) {
          this.apiInstance.logger.verbose(
            'currentUser property not set on UserSubscription',
          );
          return;
        }

        this.currentUser.userStore.user(
          userId,
          user => {
            const roomUserIdIndex = room.userIds.indexOf(user.id);

            if (roomUserIdIndex > -1) {
              room.userIds.splice(roomUserIdIndex, 1);
            }

            room.userStore.remove(user.id);

            if (this.delegate && this.delegate.userLeftRoom) {
              this.delegate.userLeftRoom(room, user);
            }

            if (room.subscription === undefined) {
              this.apiInstance.logger.verbose(
                `Room ${room.name} has no subscription object set`,
              );
            } else {
              if (
                room.subscription.delegate &&
                room.subscription.delegate.userLeft
              ) {
                room.subscription.delegate.userLeft(user);
              }
            }

            this.apiInstance.logger.verbose(
              `User ${user.id} left room ${room.name}`,
            );
          },
          error => {
            this.apiInstance.logger.verbose(
              `User with id ${userId} left room with id ${roomId} but no information about the user could be retrieved. Error was: ${error}`,
            );
            // strongSelf.delegate.error(error: err!)
            return;
          },
        );
      },
      error => {
        this.apiInstance.logger.verbose(
          `User with id ${userId} joined room with id ${roomId} but no information about the room could be retrieved. Error was: ${error}`,
        );
        // self.delegate.error(error: err!)
        return;
      },
    );
  }

  parseIsTypingPayload(eventName: string, data: any, userId: string) {
    const roomId = data.room_id;

    if (roomId === undefined || typeof roomId !== 'number') {
      this.apiInstance.logger.verbose(
        `\`room_id\` key missing or invalid in \`typing_start\` payload: ${data}`,
      );
      return;
    }

    if (!this.typingTimers[roomId]) {
      this.typingTimers[roomId] = {};
    }
    if (this.typingTimers[roomId][userId]) {
      clearTimeout(this.typingTimers[roomId][userId]);
    } else {
      this.startedTyping(roomId, userId);
    }
    this.typingTimers[roomId][userId] = setTimeout(() => {
      this.stoppedTyping(roomId, userId);
      delete this.typingTimers[roomId][userId];
    }, TYPING_REQ_TTL);
  }

  private startedTyping(roomId: number, userId: string) {
    if (!this.currentUser) {
      this.apiInstance.logger.verbose(
        'currentUser property not set on UserSubscription',
      );
      return;
    }

    this.currentUser.roomStore.room(
      roomId,
      room => {
        if (!this.currentUser) {
          this.apiInstance.logger.verbose(
            'currentUser property not set on UserSubscription',
          );
          return;
        }

        this.currentUser.userStore.user(
          userId,
          user => {
            if (this.delegate && this.delegate.userStartedTyping) {
              this.delegate.userStartedTyping(room, user);
            }

            if (room.subscription === undefined) {
              this.apiInstance.logger.verbose(
                `Room ${room.name} has no subscription object set`,
              );
            } else {
              if (
                room.subscription.delegate &&
                room.subscription.delegate.userStartedTyping
              ) {
                room.subscription.delegate.userStartedTyping(user);
              }
            }

            this.apiInstance.logger.verbose(
              `User ${user.id} started typing in room ${room.name}`,
            );
          },
          error => {
            this.apiInstance.logger.verbose(
              `Error fetching information for user ${userId}:`,
              error,
            );
            // strongSelf.delegate.error(error: err!)
            return;
          },
        );
      },
      error => {
        this.apiInstance.logger.verbose(
          `Error fetching information for room ${roomId}:`,
          error,
        );
        // self.delegate.error(error: err!)
        return;
      },
    );
  }

  private stoppedTyping(roomId: number, userId: string) {
    if (!this.currentUser) {
      this.apiInstance.logger.verbose(
        'currentUser property not set on UserSubscription',
      );
      return;
    }

    this.currentUser.roomStore.room(
      roomId,
      room => {
        if (!this.currentUser) {
          this.apiInstance.logger.verbose(
            'currentUser property not set on UserSubscription',
          );
          return;
        }

        this.currentUser.userStore.user(
          userId,
          user => {
            if (this.delegate && this.delegate.userStoppedTyping) {
              this.delegate.userStoppedTyping(room, user);
            }

            if (room.subscription === undefined) {
              this.apiInstance.logger.verbose(
                `Room ${room.name} has no subscription object set`,
              );
            } else {
              if (
                room.subscription.delegate &&
                room.subscription.delegate.userStoppedTyping
              ) {
                room.subscription.delegate.userStoppedTyping(user);
              }
            }

            this.apiInstance.logger.verbose(
              `User ${user.id} stopped typing in room ${room.name}`,
            );
          },
          error => {
            this.apiInstance.logger.debug(
              `Error fetching information for user ${userId}:`,
              error,
            );
            // strongSelf.delegate.error(error: err!)
            return;
          },
        );
      },
      error => {
        this.apiInstance.logger.debug(
          `Error fetching information for room ${roomId}:`,
          error,
        );
        // self.delegate.error(error: err!)
        return;
      },
    );
  }
}

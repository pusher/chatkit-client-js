import {
  Instance,
  SubscriptionEvent,
} from 'pusher-platform';

import ChatManagerDelegate from './chat_manager_delegate';
import GlobalUserStore from './global_user_store';
import PayloadDeserializer from './payload_deserializer';
import RoomStore from './room_store';
import User from './user';


export interface PresenceSubscriptionOptions {
  instance: Instance;
  userStore: GlobalUserStore;
  roomStore: RoomStore;
  delegate?: ChatManagerDelegate;
}

export default class PresenceSubscription {
  private instance: Instance;

  userStore: GlobalUserStore;
  roomStore: RoomStore;
  delegate: ChatManagerDelegate;

  constructor(options: PresenceSubscriptionOptions) {
    this.instance = options.instance;
    this.userStore = options.userStore;
    this.roomStore = options.roomStore;
    this.delegate = options.delegate;
  }

  handleEvent(event: SubscriptionEvent) {
    const { body, eventId, headers } = event;
    const { data } = body;
    const eventName = body.event_name;

    // self.instance.logger.log("Received event name: \(eventNameString), and data: \(apiEventData)", logLevel: .verbose)

    switch (eventName) {
      case 'initial_state':
        this.parseInitialStatePayload(eventName, data, this.userStore);
        break;
      case 'presence_update':
        this.parsePresenceUpdatePayload(eventName, data, this.userStore);
        break;
      case 'join_room_presence_update':
        this.parseJoinRoomPresenceUpdatePayload(eventName, data, this.userStore);
        break;
    }
  }

  end() {

  }

  parseInitialStatePayload(eventName: string, data: any, userStore: GlobalUserStore) {
    const userStatesPayload = data.user_states;

    if (userStatesPayload === undefined || userStatesPayload.constructor !== Array) {
       //     let error = PCPresenceEventError.keyNotPresentInEventPayload(
      //         key: "user_states",
      //         apiEventName: eventName,
      //         payload: data
      //     )

      //     self.instance.logger.log(error.localizedDescription, logLevel: .debug)
      //     self.delegate?.error(error: error)
      return;
    }

    // TODO: It will never be undefined but might throw - this is semi-aspirational code
    const userStates = userStatesPayload.map(userStatePayload => {
      return PayloadDeserializer.createPresencePayloadFromPayload(userStatePayload);
    }).filter(el => el !== undefined);

    if (userStates.length === 0) {
      // TODO: log
      console.log("No user states");
      return;
    }

    this.userStore.handleInitialPresencePayloads(
      userStates,
      () => {
        this.roomStore.rooms.forEach(room => {
          // TODO: Delegate stuff

          if (room.subscription === undefined) {
            console.log(`Room ${room.name} has no subscription object set`);
          } else {
            if (room.subscription.delegate && room.subscription.delegate.usersUpdated) {
              room.subscription.delegate.usersUpdated();
            }
          }
          // strongSelf.instance.logger.log("Users updated in room \(room.name)", logLevel: .verbose)
        })
      }
    )
  }

  parsePresenceUpdatePayload(eventName: string, data: any, userStore: GlobalUserStore) {
    const presencePayload = PayloadDeserializer.createPresencePayloadFromPayload(data);

    userStore.user(
      presencePayload.userId,
      (user) => {
        user.updatePresenceInfoIfAppropriate(presencePayload);

        switch (presencePayload.state.stringValue) {
          case 'online':
            if (this.delegate.userCameOnline) {
              this.delegate.userCameOnline(user);
            }

            // strongSelf.instance.logger.log("\(user.displayName) came online", logLevel: .verbose)
            break;
          case 'offline':
            if (this.delegate.userWentOffline) {
              this.delegate.userWentOffline(user);
            }

            // strongSelf.instance.logger.log("\(user.displayName) came offline", logLevel: .verbose)
            break;
          case 'unknown':
            // This should never be the case
            // strongSelf.instance.logger.log("Somehow the presence state of user \(user.debugDescription) is unknown", logLevel: .debug)
            break;
        }

        // TODO: Could check if any room is active to speed this up? Or keep a better
        // map of user_ids to rooms

        this.roomStore.rooms.forEach(room => {
          if (room.subscription === undefined) {
            console.log(`Room ${room.name} has no subscription object set`);
            return;
          }

          if (room.userIds.indexOf(user.id) > -1) {
            switch (presencePayload.state.stringValue) {
              case 'online':
                if (room.subscription.delegate && room.subscription.delegate.userCameOnlineInRoom) {
                  room.subscription.delegate.userCameOnlineInRoom(user);
                }
                break;
              case 'offline':
                if (room.subscription.delegate && room.subscription.delegate.userWentOfflineInRoom) {
                  room.subscription.delegate.userWentOfflineInRoom(user);
                }
                break;
              default:
                break;
            }
          }
        })
      },
      (error) => {
        // TODO: Some logging

        // strongSelf.instance.logger.log(
        //   "Error fetching user information for user with id \(presencePayload.userId): \(err!.localizedDescription)",
        //   logLevel: .debug
        // )
        return;
      }
    )
  }

  // TODO: So much duplication
  parseJoinRoomPresenceUpdatePayload(eventName: string, data: any, userStore: GlobalUserStore) {
    const userStatesPayload = data.user_states;

    if (userStatesPayload === undefined || userStatesPayload.constructor !== Array) {
       //     let error = PCPresenceEventError.keyNotPresentInEventPayload(
      //         key: "user_states",
      //         apiEventName: eventName,
      //         payload: data
      //     )

      //     self.instance.logger.log(error.localizedDescription, logLevel: .debug)
      //     self.delegate?.error(error: error)
      return;
    }

    // TODO: It will never be undefined but might throw - this is semi-aspirational code
    const userStates = userStatesPayload.map(userStatePayload => {
      return PayloadDeserializer.createPresencePayloadFromPayload(userStatePayload);
    }).filter(el => el !== undefined);

    if (userStates.length === 0) {
      // TODO: log
      console.log("No user states");
      return;
    }

    this.userStore.handleInitialPresencePayloads(
      userStates,
      () => {
        this.roomStore.rooms.forEach(room => {
          if (room.subscription === undefined) {
            console.log(`Room ${room.name} has no subscription object set`);
          } else {
            if (room.subscription.delegate && room.subscription.delegate.usersUpdated) {
              room.subscription.delegate.usersUpdated();
            }
          }

          // strongSelf.instance.logger.log("Users updated in room \(room.name)", logLevel: .verbose)
        })
      }
    )
  }

}

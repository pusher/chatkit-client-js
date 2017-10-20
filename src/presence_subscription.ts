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

    console.log('Handling event: ', event)

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
          console.log("Go through each room and update with presence payloads, sort of");
          // TODO: Delegate stuff

          // room.subscription?.delegate?.usersUpdated()
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
            // TODO: Delegate stuff
            // strongSelf.delegate?.userCameOnline(user: user)
            // strongSelf.instance.logger.log("\(user.displayName) came online", logLevel: .verbose)
            break;
          case 'offline':
            // strongSelf.delegate?.userWentOffline(user: user)
            // strongSelf.instance.logger.log("\(user.displayName) came offline", logLevel: .verbose)
            break;
          case 'unknown':
            // This should never be the case
            // strongSelf.instance.logger.log("Somehow the presence state of user \(user.debugDescription) is unknown", logLevel: .debug)
            break;
        }

      //         // TODO: Could check if any room is active to speed this up? Or keep a better
      //         // map of user_ids to rooms
      //         strongSelf.roomStore.rooms.forEach { room in
      //             guard room.users.contains(user) else {
      //                 return
      //             }

      //             switch presencePayload.state {
      //             case .online: room.subscription?.delegate?.userCameOnlineInRoom(user: user)
      //             case .offline: room.subscription?.delegate?.userWentOfflineInRoom(user: user)
      //             default: return
      //             }
      //         }
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
          console.log("Go through each room and update with presence payloads, sort of");
          // TODO: Delegate stuff

          // room.subscription?.delegate?.usersUpdated()
          // strongSelf.instance.logger.log("Users updated in room \(room.name)", logLevel: .verbose)
        })
      }
    )
  }

}

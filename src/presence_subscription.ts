import { Instance, SubscriptionEvent } from 'pusher-platform';

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
  userStore: GlobalUserStore;
  roomStore: RoomStore;
  delegate?: ChatManagerDelegate;

  private instance: Instance;

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

    this.instance.logger.verbose(
      `Received event type: ${eventName}, and data: ${data}`,
    );

    switch (eventName) {
      case 'initial_state':
        this.parseInitialStatePayload(eventName, data, this.userStore);
        break;
      case 'presence_update':
        this.parsePresenceUpdatePayload(eventName, data, this.userStore);
        break;
      case 'join_room_presence_update':
        this.parseJoinRoomPresenceUpdatePayload(
          eventName,
          data,
          this.userStore,
        );
        break;
      default:
        this.instance.logger.verbose(
          `Unsupported event type received: ${eventName}, and data: ${data}`,
        );
        break;
    }
  }

  end() {
    // TODO: Work out how to implement
  }

  parseInitialStatePayload(
    eventName: string,
    data: any,
    userStore: GlobalUserStore,
  ) {
    const userStatesPayload = data.user_states;

    if (
      userStatesPayload === undefined ||
      userStatesPayload.constructor !== Array
    ) {
      this.instance.logger.debug(
        `'user_stats' value missing from ${eventName} presence payload: ${
          data
        }`,
      );
      // TODO: Do we want the error delegate?
      // self.delegate?.error(error: error)
      return;
    }

    // TODO: It will never be undefined but might throw - this is semi-aspirational code
    const userStates = userStatesPayload
      .map((userStatePayload: any) => {
        return PayloadDeserializer.createPresencePayloadFromPayload(
          userStatePayload,
        );
      })
      .filter((el: any) => el !== undefined);

    if (userStates.length === 0) {
      this.instance.logger.verbose('No presence user states to process');
      return;
    }

    this.userStore.handleInitialPresencePayloads(userStates, () => {
      this.roomStore.rooms.forEach(room => {
        if (room.subscription === undefined) {
          this.instance.logger.verbose(
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
        this.instance.logger.verbose(`Users updated in room ${room.name}`);
      });
    });
  }

  parsePresenceUpdatePayload(
    eventName: string,
    data: any,
    userStore: GlobalUserStore,
  ) {
    const presencePayload = PayloadDeserializer.createPresencePayloadFromPayload(
      data,
    );

    userStore.user(
      presencePayload.userId,
      user => {
        user.updatePresenceInfoIfAppropriate(presencePayload);

        switch (presencePayload.state.stringValue) {
          case 'online':
            if (this.delegate && this.delegate.userCameOnline) {
              this.delegate.userCameOnline(user);
            }
            this.instance.logger.verbose(`${user.id} came online`);
            break;
          case 'offline':
            if (this.delegate && this.delegate.userWentOffline) {
              this.delegate.userWentOffline(user);
            }
            this.instance.logger.verbose(`${user.id} went offline`);
            break;
          case 'unknown':
            // This should never be the case
            this.instance.logger.verbose(
              `Somehow the presence state of user ${user.id} is unknown`,
            );
            break;
        }

        // TODO: Could check if any room is active to speed this up? Or keep a better
        // map of user_ids to rooms
        this.roomStore.rooms.forEach(room => {
          if (room.subscription === undefined) {
            this.instance.logger.verbose(
              `Room ${room.name} has no subscription object set`,
            );
            return;
          }

          if (room.userIds.indexOf(user.id) > -1) {
            switch (presencePayload.state.stringValue) {
              case 'online':
                if (
                  room.subscription.delegate &&
                  room.subscription.delegate.userCameOnlineInRoom
                ) {
                  room.subscription.delegate.userCameOnlineInRoom(user);
                }
                break;
              case 'offline':
                if (
                  room.subscription.delegate &&
                  room.subscription.delegate.userWentOfflineInRoom
                ) {
                  room.subscription.delegate.userWentOfflineInRoom(user);
                }
                break;
              default:
                break;
            }
          }
        });
      },
      error => {
        this.instance.logger.debug(
          `Error fetching user information for user with id ${
            presencePayload.userId
          }: ${error}`,
        );
        return;
      },
    );
  }

  // TODO: So much duplication
  parseJoinRoomPresenceUpdatePayload(
    eventName: string,
    data: any,
    userStore: GlobalUserStore,
  ) {
    const userStatesPayload = data.user_states;

    if (
      userStatesPayload === undefined ||
      userStatesPayload.constructor !== Array
    ) {
      this.instance.logger.debug(
        `'user_stats' value missing from ${eventName} presence payload: ${
          data
        }`,
      );
      // TODO: Delegate question again
      // self.delegate?.error(error: error)
      return;
    }

    // TODO: It will never be undefined but might throw - this is semi-aspirational code
    const userStates = userStatesPayload
      .map((userStatePayload: any) => {
        return PayloadDeserializer.createPresencePayloadFromPayload(
          userStatePayload,
        );
      })
      .filter((el: any) => el !== undefined);

    if (userStates.length === 0) {
      this.instance.logger.verbose('No presence user states to process');
      return;
    }

    this.userStore.handleInitialPresencePayloads(userStates, () => {
      this.roomStore.rooms.forEach(room => {
        if (room.subscription === undefined) {
          this.instance.logger.verbose(
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

        this.instance.logger.verbose(`Users updated in room ${room.name}`);
      });
    });
  }
}

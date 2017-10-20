import {
  Instance
} from 'pusher-platform';

import ChatManagerDelegate from './chat_manager_delegate';
import GlobalUserStore from './global_user_store';
import PayloadDeserializer from './payload_deserializer';
import PresenceSubscription from './presence_subscription';
import RoomStore from './room_store';
import Room from './room';

import { allPromisesSettled } from './utils';


export interface CreateRoomOptions {
  name: string;
  private?: boolean;
  addUserIds?: string[];
}

export interface UpdateRoomOptions {
  name?: string;
  isPrivate?: boolean;
}



export interface CurrentUserOptions {
  id: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  avatarURL?: string;
  customData?: any; // TODO: Shouldn't be any (type)
  rooms?: Room[];
  instance: Instance;
  userStore: GlobalUserStore;
}

export default class CurrentUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  avatarURL?: string;
  customData?: any;
  userStore: GlobalUserStore;
  roomStore: RoomStore;
  instance: Instance;
  pathFriendlyId: string;
  presenceSubscription: PresenceSubscription;

  constructor(options: CurrentUserOptions) {
    const { rooms, id, instance } = options;
    const validRooms: Room[] = rooms || [];

    this.id = id;
    this.createdAt = options.createdAt;
    this.updatedAt = options.updatedAt;
    this.name = options.name;
    this.avatarURL = options.avatarURL;
    this.customData = options.customData;
    this.roomStore = new RoomStore({ instance, rooms: validRooms });
    this.instance = instance;
    this.userStore = options.userStore;
    this.pathFriendlyId = encodeURIComponent(id); // TODO: This is different to Swift SDK
  }

  updateWithPropertiesOf(currentUser: CurrentUser) {
    this.updatedAt = currentUser.updatedAt;
    this.name = currentUser.name;
    this.customData = currentUser.customData;
  }

  setupPresenceSubscription(delegate: ChatManagerDelegate) {
    this.presenceSubscription = new PresenceSubscription({
      instance: this.instance,
      userStore: this.userStore,
      roomStore: this.roomStore,
      delegate: delegate,
    });

    this.instance.subscribeNonResuming({
      path: `/users/${this.id}/presence`,
      listeners: {
        onEvent: this.presenceSubscription.handleEvent.bind(this.presenceSubscription),
      }
    })
  }

  createRoom(options: CreateRoomOptions, onSuccess: (room: Room) => void, onError: (error: any) => void) {
    var roomData = {
      name: options.name,
      created_by_id: this.id,
      private: options.private || false,
    }

    if (options.addUserIds && options.addUserIds.length > 0) {
      roomData['user_ids'] = options.addUserIds;
    }

    this.instance.request({
      method: 'POST',
      path: '/rooms',
      body: roomData,
    }).then(res => {
      const roomPayload = JSON.parse(res);
      const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
      const addedOrMergedRoom = this.roomStore.addOrMerge(room);
      this.populateRoomUserStore(addedOrMergedRoom);
      onSuccess(addedOrMergedRoom);
    }).catch(err => {
      // TODO: Proper error handling
      onError(err);
      console.log("Error", err)
    })
  }

  populateRoomUserStore(room: Room) {
    // TODO: Use the soon-to-be-created new version of fetchUsersWithIds from the userStore

    const userPromises = new Array<Promise<any>>();

    room.userIds.forEach(userId => {
      const userPromise = new Promise<any>((resolve, reject) => {
        this.userStore.user(
          userId,
          (user) => {
            room.userStore.addOrMerge(user)
            resolve();
          },
          (error) => {
            // strongSelf.instance.logger.log(
            //   "Unable to add user with id \(userId) to room \(room.name): \(err!.localizedDescription)",
            //   logLevel: .debug
            // )
            reject();
          }
        )
      })

      userPromises.push(userPromise);
    })

    allPromisesSettled(userPromises).then(() => {
      console.log("All promises settled for populating room user stores");
      // TODO: Logging and delegate stuff

      // room.subscription?.delegate?.usersUpdated()
      // strongSelf.instance.logger.log("Users updated in room \(room.name)", logLevel: .verbose)
    })
  }

  // addUser(user: User, room: Room, onSuccess: () => void, onError: (error: any) => void) {
  //   this.addUsers([user], room, onSuccess, onError);
  // }

  addUser(id: string, roomId: number, onSuccess: () => void, onError: (error: any) => void) {
    this.addOrRemoveUsers(roomId, [id], 'add', onSuccess, onError);
  }

  // addUsers(users: User[], room: Room, onSuccess: () => void, onError: (error: any) => void) {
  //   const userIds = users.map(el => el.id);
  //   this.addUsers(userIds, room.id, onSuccess, onError);
  // }

  // addUsers(ids: [string], roomId: number, onSuccess: () => void, onError: (error: any) => void) {
  //   this.addOrRemoveUsers(roomId, ids, 'add', onSuccess, onError);
  // }

  // removeUser(user: User, room: Room, onSuccess: () => void, onError: (error: any) => void) {
  //   this.removeUsers([user], room, onSuccess, onError);
  // }

  removeUser(id: string, roomId: number, onSuccess: () => void, onError: (error: any) => void) {
    this.addOrRemoveUsers(roomId, [id], 'remove', onSuccess, onError);
  }

  // removeUsers(users: [PCUser], room: Room, onSuccess: () => void, onError: (error: any) => void) {
  //   const userIds = users.map(el => el.id);
  //   this.removeUsers(userIds, room.id, onSuccess, onError);
  // }

  // removeUsers(ids: string[], roomId: number, onSuccess: () => void, onError: (error: any) => void) {
  //   this.addOrRemoveUsers(roomId, ids, 'remove', onSuccess, onError);
  // }

  // updateRoom(room: Room, options: UpdateRoomOptions, onSuccess: () => void, onError: (error: any) => void) {
  //   this.updateRoom(room.id, options, onSuccess, onError);
  // }

  // updateRoom(id: number, options: UpdateRoomOptions, onSuccess: () => void, onError: (error: any) => void) {
  //   this.updateRoom(id, options, onSuccess, onError);
  // }

  updateRoom(roomId: number, options: UpdateRoomOptions, onSuccess: () => void, onError: (error: any) => void) {
    if (options.name === undefined && options.isPrivate === undefined) {
      onSuccess();
      return;
    }

    var roomPayload = {};
    if (options.name) { roomPayload['name'] = options.name; }
    if (options.isPrivate) { roomPayload['private'] = options.isPrivate; }

    this.instance.request({
      method: 'PUT',
      path: `/rooms/${roomId}`,
      body: roomPayload,
    }).then(res => {
      onSuccess();
    }).catch(err => {
      // TODO: Proper error handling
      onError(err);
      console.log("Error", err)
    })
  }

  // deleteRoom(room: Room, onSuccess: () => void, onError: (error: any) => void) {
  //   this.deleteRoom(room.id, onSuccess, onError);
  // }

  // deleteRoom(id: number, onSuccess: () => void, onError: (error: any) => void) {
  //   this.deleteRoom(id, onSuccess, onError);
  // }

  deleteRoom(roomId: number, onSuccess: () => void, onError: (error: any) => void) {
    this.instance.request({
      method: 'DELETE',
      path: `/rooms/${roomId}`,
    }).then(res => {
      onSuccess();
    }).catch(err => {
      // TODO: Proper error handling
      onError(err);
      console.log("Error", err)
    })
  }

  addOrRemoveUsers(roomId: number, userIds: string[], membershipChange: string, onSuccess: () => void, onError: (error: any) => void) {
    const usersPayload = {
      user_ids: userIds,
    }

    this.instance.request({
      method: 'PUT',
      path: `/rooms/${roomId}/users/${membershipChange}`,
      body: usersPayload,
    }).then(res => {
      onSuccess();
    }).catch(err => {
      // TODO: Proper error handling
      onError(err);
      console.log("Error", err)
    })
  }

  joinRoom(roomId: number, onSuccess: (room: Room) => void, onError: (error: any) => void) {
    this.instance.request({
      method: 'POST',
      path: `/users/${this.pathFriendlyId}/rooms/${roomId}/join`,
    }).then(res => {
      const roomPayload = JSON.parse(res);
      const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
      const addedOrMergedRoom = this.roomStore.addOrMerge(room);
      // TODO: room or addedOrMergedRoom ?
      this.populateRoomUserStore(addedOrMergedRoom);
      onSuccess(addedOrMergedRoom);
    }).catch(err => {
      // TODO: Proper error handling and logging
      onError(err);
      console.log("Error", err)
    })
  }

  leaveRoom(roomId: number, onSuccess: () => void, onError: (error: any) => void) {
    this.instance.request({
      method: 'POST',
      path: `/users/${this.pathFriendlyId}/rooms/${roomId}/leave`,
    }).then(res => {
      // TODO: Remove room from roomStore or is that handle by UserSubscription?
      onSuccess();
    }).catch(err => {
      // TODO: Proper error handling and logging
      onError(err);
      console.log("Error", err)
    })
  }

  getJoinedRooms(onSuccess: (rooms: Room[]) => void, onError: (error: any) => void) {
    this.getUserRooms(false, onSuccess, onError);
  }

  getJoinableRooms(onSuccess: (rooms: Room[]) => void, onError: (error: any) => void) {
    this.getUserRooms(true, onSuccess, onError);
  }

  getUserRooms(onlyJoinable: boolean, onSuccess: (rooms: Room[]) => void, onError: (error: any) => void) {
    const joinableQueryItemValue = onlyJoinable ? 'true' : 'false';
    this.getRooms(`/users/${this.pathFriendlyId}/rooms?joinable=${joinableQueryItemValue}`, onSuccess, onError);
  }

  getAllRooms(onSuccess: (rooms: Room[]) => void, onError: (error: any) => void) {
    this.getRooms('/rooms', onSuccess, onError);
  }

  private getRooms(path: string, onSuccess: (rooms: Room[]) => void, onError: (error: any) => void) {
    this.instance.request({
      method: 'GET',
      path: path,
    }).then(res => {
      const roomsPayload = JSON.parse(res);
      const rooms = roomsPayload.map((roomPayload) => {
        // TODO: Some logging etc
        return PayloadDeserializer.createRoomFromPayload(roomPayload);
      })
      // TODO: filter if undefined returned?
      onSuccess(rooms);
    }).catch(err => {
      // TODO: Proper error handling and logging
      onError(err);
      console.log("Error", err)
    })
  }

  // TODO: This shouldn't be an any for eventPayload
  private typingStateChange(eventPayload: any, roomId: number, onSuccess: () => void, onError: (error: any) => void) {
    this.instance.request({
      method: 'POST',
      path: `/rooms/${roomId}/events`,
      body: eventPayload,
    }).then(res => {
      onSuccess();
    }).catch(err => {
      // TODO: Proper error handling and logging
      onError(err);
      console.log("Error", err)
    })
  }
}

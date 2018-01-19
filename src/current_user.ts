import { Instance, sendRawRequest } from 'pusher-platform';

import BasicCursor from './basic_cursor';
import BasicMessage from './basic_message';
import BasicMessageEnricher from './basic_message_enricher';
import ChatManagerDelegate from './chat_manager_delegate';
import CursorSubscription from './cursor_subscription';
import CursorType from './cursor_types';
import FetchedAttachment from './fetched_attachment';
import GlobalUserStore from './global_user_store';
import Message from './message';
import PayloadDeserializer from './payload_deserializer';
import PresenceSubscription from './presence_subscription';
import Room from './room';
import RoomDelegate from './room_delegate';
import RoomStore from './room_store';
import RoomSubscription from './room_subscription';

import { TYPING_REQ_LEEWAY, TYPING_REQ_TTL } from './constants';
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

export interface FetchRoomMessagesOptions {
  initialId?: string;
  limit?: number;
  direction?: string;
}

export interface CurrentUserOptions {
  id: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  avatarURL?: string;
  customData?: any; // TODO: Shouldn't be any (type)
  rooms?: Room[];
  apiInstance: Instance;
  filesInstance: Instance;
  cursorsInstance: Instance;
  userStore: GlobalUserStore;
}

export interface DataAttachment {
  file: Blob;
  name: string;
}

export interface LinkAttachment {
  link: string;
  type: string;
}

export type GenericAttachment = LinkAttachment | DataAttachment;

export interface AttachmentBody {
  resource_link: string;
  type: string;
}

export interface SendMessageOptions {
  attachment?: GenericAttachment;
  roomId: number;
  text?: string;
}

export interface CompleteMessageOptions {
  attachment?: AttachmentBody;
  roomId: number;
  text?: string;
  user_id: string;
}

export default class CurrentUser {
  id: string;
  createdAt: string;
  cursors: { [roomId: string]: BasicCursor };
  cursorsReq: Promise<void>;
  updatedAt: string;
  name?: string;
  avatarURL?: string;
  customData?: any;
  userStore: GlobalUserStore;
  roomStore: RoomStore;
  apiInstance: Instance;
  filesInstance: Instance;
  cursorsInstance: Instance;
  pathFriendlyId: string;
  presenceSubscription: PresenceSubscription;
  typingRequestSent: { [roomId: string]: number };

  get rooms(): Room[] {
    return this.roomStore.rooms;
  }

  constructor(options: CurrentUserOptions) {
    const { rooms, id, apiInstance, filesInstance, cursorsInstance } = options;
    const validRooms: Room[] = rooms || [];

    this.id = id;
    this.createdAt = options.createdAt;
    this.cursors = {};
    this.updatedAt = options.updatedAt;
    this.name = options.name;
    this.avatarURL = options.avatarURL;
    this.customData = options.customData;
    this.roomStore = new RoomStore({ apiInstance, rooms: validRooms });
    this.apiInstance = apiInstance;
    this.filesInstance = filesInstance;
    this.cursorsInstance = cursorsInstance;
    this.userStore = options.userStore;
    this.pathFriendlyId = encodeURIComponent(id); // TODO: This is different to Swift SDK
    this.typingRequestSent = {};
  }

  updateWithPropertiesOf(currentUser: CurrentUser) {
    this.updatedAt = currentUser.updatedAt;
    this.name = currentUser.name;
    this.customData = currentUser.customData;
  }

  setupPresenceSubscription(delegate?: ChatManagerDelegate) {
    this.presenceSubscription = new PresenceSubscription({
      apiInstance: this.apiInstance,
      delegate,
      roomStore: this.roomStore,
      userStore: this.userStore,
    });

    this.apiInstance.subscribeNonResuming({
      listeners: {
        onError: delegate && delegate.error,
        onEvent: this.presenceSubscription.handleEvent.bind(
          this.presenceSubscription,
        ),
      },
      path: `/users/${this.id}/presence`,
    });
  }

  async createRoom(options: CreateRoomOptions): Promise<Room> {
    const roomData: any = {
      created_by_id: this.id,
      name: options.name,
      private: options.private || false,
    };

    if (options.addUserIds && options.addUserIds.length > 0) {
      // tslint:disable-next-line:no-string-literal
      roomData['user_ids'] = options.addUserIds;
    }

    try {
      const res = await this.apiInstance.request({
        json: roomData,
        method: 'POST',
        path: '/rooms',
      });
      const roomPayload = JSON.parse(res);
      const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
      const addedOrMergedRoom = this.roomStore.addOrMerge(room);
      this.populateRoomUserStore(addedOrMergedRoom);
      return addedOrMergedRoom;
    } catch (err) {
      this.apiInstance.logger.verbose('Error creating room:', err);
      throw err;
    }
  }

  populateRoomUserStore(room: Room) {
    // TODO: Use the soon-to-be-created new version of fetchUsersWithIds from the userStore

    const userPromises = new Array<Promise<any>>();

    room.userIds.forEach(userId => {
      const userPromise = new Promise<any>((resolve, reject) => {
        this.userStore.user(
          userId,
          user => {
            room.userStore.addOrMerge(user);
            resolve();
          },
          error => {
            this.apiInstance.logger.debug(
              `Unable to add user with id ${userId} to room \(room.name): ${error}`,
            );
            reject();
          },
        );
      });

      userPromises.push(userPromise);
    });

    allPromisesSettled(userPromises).then(() => {
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

  addUser(id: string, roomId: number) {
    return this.addOrRemoveUsers(roomId, [id], 'add');
  }

  removeUser(id: string, roomId: number) {
    return this.addOrRemoveUsers(roomId, [id], 'remove');
  }

  async updateRoom(roomId: number, options: UpdateRoomOptions): Promise<void> {
    if (options.name === undefined && options.isPrivate === undefined) {
      return;
    }

    const roomPayload: any = {};
    if (options.name) {
      // tslint:disable-next-line:no-string-literal
      roomPayload['name'] = options.name;
    }
    if (options.isPrivate) {
      // tslint:disable-next-line:no-string-literal
      roomPayload['private'] = options.isPrivate;
    }

    try {
      await this.apiInstance.request({
        json: roomPayload,
        method: 'PUT',
        path: `/rooms/${roomId}`,
      });
    } catch (err) {
      this.apiInstance.logger.verbose(`Error updating room ${roomId}:`, err);
      throw err;
    }
  }

  async deleteRoom(roomId: number): Promise<void> {
    try {
      await this.apiInstance.request({
        method: 'DELETE',
        path: `/rooms/${roomId}`,
      });
    } catch (err) {
      this.apiInstance.logger.verbose(`Error deleting room ${roomId}:`, err);
      throw err;
    }
  }

  async addOrRemoveUsers(
    roomId: number,
    userIds: string[],
    membershipChange: string,
  ): Promise<void> {
    const usersPayload = {
      user_ids: userIds,
    };

    try {
      await this.apiInstance.request({
        json: usersPayload,
        method: 'PUT',
        path: `/rooms/${roomId}/users/${membershipChange}`,
      });
    } catch (err) {
      this.apiInstance.logger.verbose(
        `Error when attempting to ${membershipChange} users from room ${roomId}:`,
        err,
      );
      throw err;
    }
  }

  async joinRoom(roomId: number): Promise<Room> {
    try {
      const res = await this.apiInstance.request({
        method: 'POST',
        path: `/users/${this.pathFriendlyId}/rooms/${roomId}/join`,
      });
      const roomPayload = JSON.parse(res);
      const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
      const addedOrMergedRoom = this.roomStore.addOrMerge(room);
      // TODO: room or addedOrMergedRoom ?
      this.populateRoomUserStore(addedOrMergedRoom);
      return addedOrMergedRoom;
    } catch (err) {
      this.apiInstance.logger.verbose(`Error joining room ${roomId}:`, err);
      throw err;
    }
  }

  async leaveRoom(roomId: number): Promise<void> {
    try {
      await this.apiInstance.request({
        method: 'POST',
        path: `/users/${this.pathFriendlyId}/rooms/${roomId}/leave`,
      });
    } catch (err) {
      this.apiInstance.logger.verbose(`Error leaving room ${roomId}:`, err);
      throw err;
    }
  }

  getJoinedRooms(): Promise<Room[]> {
    return this.getUserRooms(false);
  }

  getJoinableRooms(): Promise<Room[]> {
    return this.getUserRooms(true);
  }

  getUserRooms(onlyJoinable: boolean): Promise<Room[]> {
    const joinableQueryItemValue = onlyJoinable ? 'true' : 'false';
    return this.getRooms(
      `/users/${this.pathFriendlyId}/rooms?joinable=${joinableQueryItemValue}`,
    );
  }

  getAllRooms(): Promise<Room[]> {
    return this.getRooms('/rooms');
  }

  async isTypingIn(roomId: number): Promise<void> {
    const now = Date.now();
    const sent = this.typingRequestSent[roomId];
    const eventName = 'typing_start';
    const eventPayload = {
      // TODO this would ideally be is_typing or typing_heartbeat or some such
      name: 'typing_start',
      user_id: this.id,
    };
    if (!sent || now - sent > TYPING_REQ_TTL - TYPING_REQ_LEEWAY) {
      this.typingRequestSent[roomId] = now;
      try {
        await this.apiInstance.request({
          json: eventPayload,
          method: 'POST',
          path: `/rooms/${roomId}/events`,
        });
      } catch (err) {
        delete this.typingRequestSent[roomId];
        this.apiInstance.logger.verbose(
          `Error sending ${eventName} event in room ${roomId}:`,
          err,
        );
        throw err;
      }
    }
  }

  async setCursor(position: number, room: Room): Promise<void> {
    try {
      await this.cursorsInstance.request({
        json: { position },
        method: 'PUT',
        path: `/cursors/${CursorType.Read}/rooms/${room.id}/users/${this.id}`,
      });
    } catch (err) {
      this.cursorsInstance.logger.verbose(
        `Error setting cursor in room ${room.name}:`,
        err,
      );
      throw err;
    }
  }

  async sendMessage(options: SendMessageOptions): Promise<number> {
    const { attachment, ...rest } = options;
    const completeOptions: CompleteMessageOptions = {
      user_id: this.id,
      ...rest,
    };

    if (attachment !== undefined) {
      if (this.isDataAttachment(attachment)) {
        return this.sendMessageWithCompleteOptions({
          attachment: await this.uploadFile(
            attachment.file,
            attachment.name,
            options.roomId,
          ),
          ...completeOptions,
        });
      } else if (this.isLinkAttachment(attachment)) {
        return this.sendMessageWithCompleteOptions({
          attachment: {
            resource_link: attachment.link,
            type: attachment.type,
          },
          ...completeOptions,
        });
      } else {
        this.apiInstance.logger.debug(
          'Message not sent: invalid attachment property provided: ',
          attachment,
        );
        throw TypeError('invalid attachment');
      }
    }
    return this.sendMessageWithCompleteOptions(completeOptions);
  }

  async subscribeToRoom(
    room: Room,
    roomDelegate: RoomDelegate,
    messageLimit = 20,
  ) {
    await this.cursorsReq;
    room.subscription = new RoomSubscription({
      basicMessageEnricher: new BasicMessageEnricher(
        this.userStore,
        room,
        this.apiInstance.logger,
      ),
      delegate: roomDelegate,
      logger: this.apiInstance.logger,
    });
    this.apiInstance.subscribeNonResuming({
      listeners: {
        onError: roomDelegate.error,
        onEvent: room.subscription.handleEvent.bind(room.subscription),
      },
      path: `/rooms/${room.id}?message_limit=${messageLimit}`,
    });
    this.subscribeToCursors(room, roomDelegate);
  }

  async fetchMessagesFromRoom(
    room: Room,
    fetchOptions: FetchRoomMessagesOptions,
  ): Promise<Message[]> {
    const initialIdQueryParam = fetchOptions.initialId
      ? `initial_id=${fetchOptions.initialId}`
      : '';
    const limitQueryParam = fetchOptions.limit
      ? `limit=${fetchOptions.limit}`
      : '';
    const directionQueryParam = fetchOptions.direction
      ? `direction=${fetchOptions.direction}`
      : 'direction=older';

    const combinedQueryParams = [
      initialIdQueryParam,
      limitQueryParam,
      directionQueryParam,
    ].join('&');

    try {
      const res = await this.apiInstance.request({
        method: 'GET',
        path: `/rooms/${room.id}/messages?${combinedQueryParams}`,
      });
      const messagesPayload = JSON.parse(res);

      const messages = new Array<Message>();
      const basicMessages = new Array<BasicMessage>();

      // TODO: Error handling
      const messageUserIds = messagesPayload.map((messagePayload: any) => {
        const basicMessage = PayloadDeserializer.createBasicMessageFromPayload(
          messagePayload,
        );
        basicMessages.push(basicMessage);
        return basicMessage.id;
      });

      const messageUserIdsSet = new Set<string>(messageUserIds);
      const userIdsToFetch = Array.from(messageUserIdsSet.values());

      const users = await this.userStore.fetchUsersWithIds(userIdsToFetch);
      const messageEnricher = new BasicMessageEnricher(
        this.userStore,
        room,
        this.apiInstance.logger,
      );
      const enrichmentPromises = new Array<Promise<any>>();

      basicMessages.forEach(basicMessage => {
        const enrichmentPromise = new Promise<any>((resolve, reject) => {
          messageEnricher.enrich(
            basicMessage,
            message => {
              messages.push(message);
              resolve();
            },
            error => {
              this.apiInstance.logger.verbose(
                `Unable to enrich basic mesage ${basicMessage.id}: ${error}`,
              );
              reject();
            },
          );
        });

        enrichmentPromises.push(enrichmentPromise);
      });

      await allPromisesSettled(enrichmentPromises);
      if (room.subscription === undefined) {
        this.apiInstance.logger.verbose(
          `Room ${room.name} has no subscription object set`,
        );
      } else if (
        room.subscription.delegate &&
        room.subscription.delegate.usersUpdated
      ) {
        room.subscription.delegate.usersUpdated();
      }

      this.apiInstance.logger.verbose(`Users updated in room ${room.name}`);

      return messages.sort((msgOne, msgTwo) => msgOne.id - msgTwo.id);
    } catch (err) {
      this.apiInstance.logger.verbose(
        `Error fetching messages froom room ${room.name}:`,
        err,
      );
      throw err;
    }
  }

  fetchAttachment(attachmentURL: string): Promise<any> {
    if (!this.apiInstance.tokenProvider) {
      return new Promise<any>((resolve, reject) => {
        reject(new Error('Token provider not set on apiInstance'));
      });
    }

    return this.apiInstance.tokenProvider.fetchToken().then((token: string) => {
      return sendRawRequest({
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
        url: attachmentURL,
      }).then((res: any) => {
        const attachmentPayload = JSON.parse(res);
        const fetchedAttachment = PayloadDeserializer.createFetchedAttachmentFromPayload(
          attachmentPayload,
        );

        return fetchedAttachment;
      });
    });
  }

  private isDataAttachment(attachment: any): attachment is DataAttachment {
    return (
      (attachment as DataAttachment).file !== undefined &&
      (attachment as DataAttachment).name !== undefined
    );
  }

  private isLinkAttachment(attachment: any): attachment is LinkAttachment {
    return (
      (attachment as LinkAttachment).link !== undefined &&
      (attachment as LinkAttachment).type !== undefined
    );
  }

  private uploadFile(
    file: any,
    fileName: string,
    roomId: number,
  ): Promise<any> {
    const data = new FormData();
    data.append('file', file, fileName);

    return this.filesInstance
      .request({
        body: data,
        method: 'POST',
        path: `/rooms/${roomId}/files/${fileName}`,
      })
      .then((res: any) => {
        return JSON.parse(res);
      });
  }

  private async sendMessageWithCompleteOptions(
    options: CompleteMessageOptions,
  ): Promise<number> {
    try {
      const res = await this.apiInstance.request({
        json: options,
        method: 'POST',
        path: `/rooms/${options.roomId}/messages`,
      });
      return JSON.parse(res).message_id;
    } catch (err) {
      this.apiInstance.logger.verbose(
        `Error sending message to room ${options.roomId}:`,
        err,
      );
      throw err;
    }
  }

  private subscribeToCursors(room: Room, roomDelegate: RoomDelegate) {
    room.cursorSubscription = new CursorSubscription({
      delegate: roomDelegate,
      handleCursorSetInternal: (cursor: BasicCursor) => {
        if (cursor.userId === this.id && this.cursors !== undefined) {
          this.cursors[cursor.roomId] = cursor;
        }
      },
      logger: this.cursorsInstance.logger,
      room,
      userStore: this.userStore,
    });

    this.cursorsInstance.subscribeNonResuming({
      listeners: {
        onEvent: room.cursorSubscription.handleEvent.bind(
          room.cursorSubscription,
        ),
      },
      path: `/cursors/${CursorType.Read}/rooms/${room.id}`,
    });
  }

  private async getRooms(path: string): Promise<Room[]> {
    try {
      const res = await this.apiInstance.request({
        method: 'GET',
        path,
      });
      const roomsPayload = JSON.parse(res);
      return roomsPayload.map((roomPayload: any) => {
        return PayloadDeserializer.createRoomFromPayload(roomPayload);
      });
    } catch (err) {
      this.apiInstance.logger.verbose(
        'Error when getting instance rooms:',
        err,
      );
      throw err;
    }
  }
}

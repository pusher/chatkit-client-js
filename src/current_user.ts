import { Instance, sendRawRequest } from 'pusher-platform';

import BasicMessage from './basic_message';
import BasicMessageEnricher from './basic_message_enricher';
import ChatManagerDelegate from './chat_manager_delegate';
import CursorSubscription from './cursor_subscription';
import FetchedAttachment from './fetched_attachment';
import GlobalUserStore from './global_user_store';
import Message from './message';
import PayloadDeserializer from './payload_deserializer';
import PresenceSubscription from './presence_subscription';
import Room from './room';
import RoomDelegate from './room_delegate';
import RoomStore from './room_store';
import RoomSubscription from './room_subscription';

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

  get rooms(): Room[] {
    return this.roomStore.rooms;
  }

  constructor(options: CurrentUserOptions) {
    const { rooms, id, apiInstance, filesInstance, cursorsInstance } = options;
    const validRooms: Room[] = rooms || [];

    this.id = id;
    this.createdAt = options.createdAt;
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

  createRoom(
    options: CreateRoomOptions,
    onSuccess: (room: Room) => void,
    onError: (error: any) => void,
  ) {
    const roomData: any = {
      created_by_id: this.id,
      name: options.name,
      private: options.private || false,
    };

    if (options.addUserIds && options.addUserIds.length > 0) {
      // tslint:disable-next-line:no-string-literal
      roomData['user_ids'] = options.addUserIds;
    }

    this.apiInstance
      .request({
        json: roomData,
        method: 'POST',
        path: '/rooms',
      })
      .then((res: any) => {
        const roomPayload = JSON.parse(res);
        const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
        const addedOrMergedRoom = this.roomStore.addOrMerge(room);
        this.populateRoomUserStore(addedOrMergedRoom);
        onSuccess(addedOrMergedRoom);
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose('Error creating room:', error);
        onError(error);
      });
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

  addUser(
    id: string,
    roomId: number,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    this.addOrRemoveUsers(roomId, [id], 'add', onSuccess, onError);
  }

  // addUsers(ids: [string], roomId: number, onSuccess: () => void, onError: (error: any) => void) {
  //   this.addOrRemoveUsers(roomId, ids, 'add', onSuccess, onError);
  // }

  removeUser(
    id: string,
    roomId: number,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    this.addOrRemoveUsers(roomId, [id], 'remove', onSuccess, onError);
  }

  // removeUsers(ids: string[], roomId: number, onSuccess: () => void, onError: (error: any) => void) {
  //   this.addOrRemoveUsers(roomId, ids, 'remove', onSuccess, onError);
  // }

  updateRoom(
    roomId: number,
    options: UpdateRoomOptions,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    if (options.name === undefined && options.isPrivate === undefined) {
      onSuccess();
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

    this.apiInstance
      .request({
        json: roomPayload,
        method: 'PUT',
        path: `/rooms/${roomId}`,
      })
      .then((res: any) => {
        onSuccess();
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(
          `Error updating room ${roomId}:`,
          error,
        );
        onError(error);
      });
  }

  deleteRoom(
    roomId: number,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    this.apiInstance
      .request({
        method: 'DELETE',
        path: `/rooms/${roomId}`,
      })
      .then((res: any) => {
        onSuccess();
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(
          `Error deleting room ${roomId}:`,
          error,
        );
        onError(error);
      });
  }

  addOrRemoveUsers(
    roomId: number,
    userIds: string[],
    membershipChange: string,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    const usersPayload = {
      user_ids: userIds,
    };

    this.apiInstance
      .request({
        json: usersPayload,
        method: 'PUT',
        path: `/rooms/${roomId}/users/${membershipChange}`,
      })
      .then((res: any) => {
        onSuccess();
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(
          `Error when attempting to ${membershipChange} users from room ${roomId}:`,
          error,
        );
        onError(error);
      });
  }

  joinRoom(
    roomId: number,
    onSuccess: (room: Room) => void,
    onError: (error: any) => void,
  ) {
    this.apiInstance
      .request({
        method: 'POST',
        path: `/users/${this.pathFriendlyId}/rooms/${roomId}/join`,
      })
      .then((res: any) => {
        const roomPayload = JSON.parse(res);
        const room = PayloadDeserializer.createRoomFromPayload(roomPayload);
        const addedOrMergedRoom = this.roomStore.addOrMerge(room);
        // TODO: room or addedOrMergedRoom ?
        this.populateRoomUserStore(addedOrMergedRoom);
        onSuccess(addedOrMergedRoom);
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(`Error joining room ${roomId}:`, error);
        onError(error);
      });
  }

  leaveRoom(
    roomId: number,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    this.apiInstance
      .request({
        method: 'POST',
        path: `/users/${this.pathFriendlyId}/rooms/${roomId}/leave`,
      })
      .then((res: any) => {
        // TODO: Remove room from roomStore or is that handle by UserSubscription?
        onSuccess();
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(`Error leaving room ${roomId}:`, error);
        onError(error);
      });
  }

  getJoinedRooms(
    onSuccess: (rooms: Room[]) => void,
    onError: (error: any) => void,
  ) {
    this.getUserRooms(false, onSuccess, onError);
  }

  getJoinableRooms(
    onSuccess: (rooms: Room[]) => void,
    onError: (error: any) => void,
  ) {
    this.getUserRooms(true, onSuccess, onError);
  }

  getUserRooms(
    onlyJoinable: boolean,
    onSuccess: (rooms: Room[]) => void,
    onError: (error: any) => void,
  ) {
    const joinableQueryItemValue = onlyJoinable ? 'true' : 'false';
    this.getRooms(
      `/users/${this.pathFriendlyId}/rooms?joinable=${joinableQueryItemValue}`,
      onSuccess,
      onError,
    );
  }

  getAllRooms(
    onSuccess: (rooms: Room[]) => void,
    onError: (error: any) => void,
  ) {
    this.getRooms('/rooms', onSuccess, onError);
  }

  startedTypingIn(
    roomId: number,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    const eventPayload = {
      name: 'typing_start',
      user_id: this.id,
    };
    this.typingStateChange(eventPayload, roomId, onSuccess, onError);
  }

  stoppedTypingIn(
    roomId: number,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    const eventPayload = {
      name: 'typing_stop',
      user_id: this.id,
    };
    this.typingStateChange(eventPayload, roomId, onSuccess, onError);
  }

  setCursor(
    position: number,
    room: Room,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    this.cursorsInstance
      .request({
        json: { position },
        method: 'PUT',
        path: `/cursors/0/rooms/${room.id}/users/${this.id}`,
      })
      .then(onSuccess)
      .catch(err => {
        this.cursorsInstance.logger.verbose(
          `Error setting cursor in room ${room.name}:`,
          err,
        );
        onError(err);
      });
  }

  sendMessage(
    options: SendMessageOptions,
    onSuccess: (messageId: number) => void,
    onError: (error: any) => void,
  ) {
    const { attachment, ...rest } = options;
    const completeOptions: CompleteMessageOptions = {
      user_id: this.id,
      ...rest,
    };

    if (attachment !== undefined) {
      if (this.isDataAttachment(attachment)) {
        const { file, name } = attachment;
        this.uploadFile(file, name, options.roomId)
          .then((fileRes: any) => {
            this.sendMessageWithCompleteOptions(
              {
                attachment: fileRes,
                user_id: this.id,
                ...rest,
              },
              onSuccess,
              onError,
            );
          })
          .catch((error: any) => {
            onError(error);
            return;
          });
      } else if (this.isLinkAttachment(attachment)) {
        const { link, type } = attachment;
        completeOptions.attachment = {
          resource_link: link,
          type,
        };
        this.sendMessageWithCompleteOptions(
          completeOptions,
          onSuccess,
          onError,
        );
      } else {
        this.apiInstance.logger.debug(
          'Message not sent: invalid attachment property provided: ',
          attachment,
        );
      }
    } else {
      this.sendMessageWithCompleteOptions(completeOptions, onSuccess, onError);
    }
  }

  // TODO: Do I need to add a Last-Event-ID option here?
  subscribeToRoom(room: Room, roomDelegate: RoomDelegate, messageLimit = 20) {
    room.subscription = new RoomSubscription({
      basicMessageEnricher: new BasicMessageEnricher(
        this.userStore,
        room,
        this.apiInstance.logger,
      ),
      delegate: roomDelegate,
      logger: this.apiInstance.logger,
    });

    // TODO: What happens if you provide both a message_limit and a Last-Event-ID?

    this.apiInstance.subscribeNonResuming({
      listeners: {
        onError: roomDelegate.error,
        onEvent: room.subscription.handleEvent.bind(room.subscription),
      },
      path: `/rooms/${room.id}?message_limit=${messageLimit}`,
    });

    if (roomDelegate.cursorSet) {
      this.subscribeToCursors(room, roomDelegate);
    }
  }

  fetchMessagesFromRoom(
    room: Room,
    fetchOptions: FetchRoomMessagesOptions,
    onSuccess: (messages: Message[]) => void,
    onError: (error: any) => void,
  ) {
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

    this.apiInstance
      .request({
        method: 'GET',
        path: `/rooms/${room.id}/messages`,
      })
      .then((res: any) => {
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

        this.userStore.fetchUsersWithIds(
          userIdsToFetch,
          users => {
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
                      `Unable to enrich basic mesage ${
                        basicMessage.id
                      }: ${error}`,
                    );
                    reject();
                  },
                );
              });

              enrichmentPromises.push(enrichmentPromise);
            });

            allPromisesSettled(enrichmentPromises).then(() => {
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
                `Users updated in room ${room.name}`,
              );

              onSuccess(
                messages.sort((msgOne, msgTwo) => msgOne.id - msgTwo.id),
              );
            });
          },
          error => {
            this.apiInstance.logger.verbose(
              `Error fetching users with ids ${userIdsToFetch}:`,
              error,
            );
          },
        );
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(
          `Error fetching messages froom room ${room.name}:`,
          error,
        );
        onError(error);
      });
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

  private sendMessageWithCompleteOptions(
    options: CompleteMessageOptions,
    onSuccess: (messageId: number) => void,
    onError: (error: any) => void,
  ) {
    this.apiInstance
      .request({
        json: options,
        method: 'POST',
        path: `/rooms/${options.roomId}/messages`,
      })
      .then((res: any) => {
        const messageIdPayload = JSON.parse(res);
        const messageId = messageIdPayload.message_id;
        onSuccess(messageId);
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(
          `Error sending message to room ${options.roomId}:`,
          error,
        );
        onError(error);
      });
  }

  private subscribeToCursors(room: Room, roomDelegate: RoomDelegate) {
    room.cursorSubscription = new CursorSubscription({
      delegate: roomDelegate,
      logger: this.cursorsInstance.logger,
    });

    this.cursorsInstance.subscribeNonResuming({
      listeners: {
        onEvent: room.cursorSubscription.handleEvent.bind(
          room.cursorSubscription,
        ),
      },
      path: `/cursors/0/rooms/${room.id}`,
    });
  }

  private getRooms(
    path: string,
    onSuccess: (rooms: Room[]) => void,
    onError: (error: any) => void,
  ) {
    this.apiInstance
      .request({
        method: 'GET',
        path,
      })
      .then((res: any) => {
        const roomsPayload = JSON.parse(res);
        const rooms = roomsPayload.map((roomPayload: any) => {
          return PayloadDeserializer.createRoomFromPayload(roomPayload);
        });
        // TODO: filter if undefined returned?
        onSuccess(rooms);
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(
          'Error when getting instance rooms:',
          error,
        );
        onError(error);
      });
  }

  // TODO: This shouldn't be an any for eventPayload
  private typingStateChange(
    eventPayload: any,
    roomId: number,
    onSuccess: () => void,
    onError: (error: any) => void,
  ) {
    this.apiInstance
      .request({
        json: eventPayload,
        method: 'POST',
        path: `/rooms/${roomId}/events`,
      })
      .then((res: any) => {
        onSuccess();
      })
      .catch((error: any) => {
        this.apiInstance.logger.verbose(
          `Error sending typing state change in room ${roomId}:`,
          error,
        );
        onError(error);
      });
  }
}

import {
  BaseClient,
  HOST_BASE,
  Instance,
  Logger,
  TokenProvider,
} from 'pusher-platform';

import BasicCursor from './basic_cursor';
import ChatManagerDelegate from './chat_manager_delegate';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import PayloadDeserializer from './payload_deserializer';
import CKTokenProvider from './token_provider';
import UserSubscription from './user_subscription';

export interface ChatManagerOptions {
  instanceLocator: string;
  tokenProvider: TokenProvider;
  logger?: Logger;
  baseClient?: BaseClient;
  userId: string;
}

export default class ChatManager {
  apiInstance: Instance;
  filesInstance: Instance;
  cursorsInstance: Instance;
  userId: string;

  private userStore: GlobalUserStore;
  private userSubscription: UserSubscription;

  constructor(options: ChatManagerOptions) {
    this.userId = options.userId;
    const splitInstanceLocator = options.instanceLocator.split(':');
    if (splitInstanceLocator.length !== 3) {
      throw new Error('The instanceLocator property is in the wrong format!');
    }
    const cluster = splitInstanceLocator[1];
    const baseClient =
      options.baseClient ||
      new BaseClient({
        host: `${cluster}.${HOST_BASE}`,
        logger: options.logger,
      });

    if (options.tokenProvider instanceof CKTokenProvider) {
      options.tokenProvider.userId = this.userId;
    }
    const sharedInstanceOptions = {
      client: baseClient,
      locator: options.instanceLocator,
      logger: options.logger,
      tokenProvider: options.tokenProvider,
    };

    this.apiInstance = new Instance({
      serviceName: 'chatkit',
      serviceVersion: 'v1',
      ...sharedInstanceOptions,
    });

    this.filesInstance = new Instance({
      serviceName: 'chatkit_files',
      serviceVersion: 'v1',
      ...sharedInstanceOptions,
    });

    this.cursorsInstance = new Instance({
      serviceName: 'chatkit_cursors',
      serviceVersion: 'v1',
      ...sharedInstanceOptions,
    });

    this.userStore = new GlobalUserStore({ apiInstance: this.apiInstance });
  }

  connect(delegate: ChatManagerDelegate): Promise<CurrentUser> {
    const cursorsReq: Promise<{
      [roomId: number]: BasicCursor;
    }> = this.cursorsInstance
      .request({
        method: 'GET',
        path: `/cursors/0/users/${this.userId}`,
      })
      .then(res => {
        const cursors = JSON.parse(res);
        const cursorsByRoom: { [roomId: number]: BasicCursor } = {};
        cursors.forEach((c: any): void => {
          cursorsByRoom[
            c.room_id
          ] = PayloadDeserializer.createBasicCursorFromPayload(c);
        });
        return cursorsByRoom;
      });

    return new Promise((resolve, reject) => {
      this.userSubscription = new UserSubscription({
        apiInstance: this.apiInstance,
        connectCompletionHandler: (currentUser?: CurrentUser, error?: any) => {
          if (currentUser) {
            currentUser.cursorsReq = cursorsReq
              .then(cursors => {
                currentUser.cursors = cursors;
              })
              .catch(err => {
                this.cursorsInstance.logger.verbose(
                  'Error getting cursors:',
                  err,
                );
              });
            resolve(currentUser);
          } else {
            reject(error);
          }
        },
        cursorsInstance: this.cursorsInstance,
        delegate,
        filesInstance: this.filesInstance,
        userStore: this.userStore,
      });

      this.apiInstance.subscribeNonResuming({
        listeners: {
          onError: delegate.error,
          onEvent: this.userSubscription.handleEvent.bind(
            this.userSubscription,
          ),
        },
        path: '/users',
      });
    });
  }
}

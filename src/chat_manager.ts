import {
  BaseClient,
  HOST_BASE,
  Instance,
  Logger,
  TokenProvider,
} from 'pusher-platform';

import ChatManagerDelegate from './chat_manager_delegate';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import UserSubscription from './user_subscription';

export interface ChatManagerOptions {
  instanceLocator: string;
  tokenProvider: TokenProvider;
  logger?: Logger;
  baseClient?: BaseClient;
}

export default class ChatManager {
  apiInstance: Instance;
  filesInstance: Instance;
  cursorsInstance: Instance;

  private userStore: GlobalUserStore;
  private userSubscription: UserSubscription;

  constructor(options: ChatManagerOptions) {
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

  connect(options: ConnectOptions) {
    this.userSubscription = new UserSubscription({
      apiInstance: this.apiInstance,
      connectCompletionHandler: (currentUser?: CurrentUser, error?: any) => {
        if (currentUser) {
          options.onSuccess(currentUser);
        } else {
          options.onError(error);
        }
      },
      cursorsInstance: this.cursorsInstance,
      delegate: options.delegate,
      filesInstance: this.filesInstance,
      userStore: this.userStore,
    });

    this.apiInstance.subscribeNonResuming({
      listeners: {
        onError: options.onError,
        onEvent: this.userSubscription.handleEvent.bind(this.userSubscription),
      },
      path: '/users',
    });
  }
}

export interface ConnectOptions {
  delegate?: ChatManagerDelegate;
  onSuccess: (currentUser: CurrentUser) => void;
  onError: (error: any) => void;
}

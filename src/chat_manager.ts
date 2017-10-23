import {
  Instance,
  TokenProvider,
  Logger,
  BaseClient,
} from 'pusher-platform';

import ChatManagerDelegate from './chat_manager_delegate';
import CurrentUser from './current_user';
import GlobalUserStore from './global_user_store';
import UserSubscription from './user_subscription';

export interface ChatManagerOptions {
  instanceId: string;
  tokenProvider: TokenProvider;
  logger?: Logger;
  baseClient?: BaseClient;
}

export default class ChatManager {
  private instance: Instance;
  private userSubscription: UserSubscription;
  private userStore: GlobalUserStore;
  tokenProvider: TokenProvider;

  constructor(options: ChatManagerOptions) {
    // if (!logger && logLevel) {
    //   logger = new PusherPlatform.ConsoleLogger(logLevel);
    // }

    this.tokenProvider = options.tokenProvider;

    this.instance = new Instance({
      instanceId: options.instanceId,
      serviceName: 'chatkit',
      serviceVersion: 'v1',
      tokenProvider: options.tokenProvider,
      client: options.baseClient,
      // TODO: logger,
    });

    this.userStore = new GlobalUserStore({ instance: this.instance });
  }

  connect(options: ConnectOptions) {
    this.userSubscription = new UserSubscription({
      delegate: options.delegate,
      instance: this.instance,
      userStore: this.userStore,
      connectCompletionHandler: (currentUser, error) => {
        if (currentUser) {
          options.onSuccess(currentUser);
        } else {
          options.onError(error);
        }
      }
    });

    this.instance.subscribeNonResuming({
      path: '/users',
      listeners: {
        onEvent: this.userSubscription.handleEvent.bind(this.userSubscription),
      }
    })
  }
}

export interface ConnectOptions {
  delegate?: ChatManagerDelegate;
  onSuccess: (currentUser: CurrentUser) => void;
  onError: (error: any) => void;
}

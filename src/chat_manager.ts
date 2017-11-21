import { BaseClient, Instance, Logger, TokenProvider } from 'pusher-platform';

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
  instance: Instance;
  tokenProvider: TokenProvider;

  private userStore: GlobalUserStore;
  private userSubscription: UserSubscription;

  constructor(options: ChatManagerOptions) {
    this.tokenProvider = options.tokenProvider;

    this.instance = new Instance({
      client: options.baseClient,
      locator: options.instanceLocator,
      logger: options.logger,
      serviceName: 'chatkit',
      serviceVersion: 'v1',
      tokenProvider: options.tokenProvider,
    });

    this.userStore = new GlobalUserStore({ instance: this.instance });
  }

  connect(options: ConnectOptions) {
    this.userSubscription = new UserSubscription({
      connectCompletionHandler: (currentUser, error) => {
        if (currentUser) {
          options.onSuccess(currentUser);
        } else {
          options.onError(error);
        }
      },
      delegate: options.delegate,
      instance: this.instance,
      userStore: this.userStore,
    });

    this.instance.subscribeNonResuming({
      listeners: {
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

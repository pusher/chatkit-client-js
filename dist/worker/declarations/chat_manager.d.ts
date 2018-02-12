import { BaseClient, Instance, Logger, TokenProvider } from 'pusher-platform';
import ChatManagerDelegate from './chat_manager_delegate';
import CurrentUser from './current_user';
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
    private userStore;
    private userSubscription;
    constructor(options: ChatManagerOptions);
    connect(options: ConnectOptions): void;
}
export interface ConnectOptions {
    delegate?: ChatManagerDelegate;
    onSuccess: (currentUser: CurrentUser) => void;
    onError: (error: any) => void;
}

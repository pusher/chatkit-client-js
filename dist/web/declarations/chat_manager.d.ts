import { Instance, TokenProvider, Logger, BaseClient } from 'pusher-platform';
import ChatManagerDelegate from './chat_manager_delegate';
import CurrentUser from './current_user';
export interface ChatManagerOptions {
    instanceLocator: string;
    tokenProvider: TokenProvider;
    logger?: Logger;
    baseClient?: BaseClient;
}
export default class ChatManager {
    private userSubscription;
    private userStore;
    instance: Instance;
    tokenProvider: TokenProvider;
    constructor(options: ChatManagerOptions);
    connect(options: ConnectOptions): void;
}
export interface ConnectOptions {
    delegate?: ChatManagerDelegate;
    onSuccess: (currentUser: CurrentUser) => void;
    onError: (error: any) => void;
}

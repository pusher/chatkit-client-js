import PresencePayload from './presence_payload';
import PresenceState from './presence_state';
export interface UserOptions {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    avatarURL: string;
    customData: any;
}
export default class User {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    avatarURL: string;
    customData: any;
    presenceState: PresenceState;
    lastSeenAt?: string;
    constructor(options: UserOptions);
    updateWithPropertiesOfUser(user: User): this;
    updatePresenceInfoIfAppropriate(newInfoPayload: PresencePayload): void;
}

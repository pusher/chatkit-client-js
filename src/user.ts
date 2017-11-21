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

  constructor(options: UserOptions) {
    this.id = options.id;
    this.createdAt = options.createdAt;
    this.updatedAt = options.updatedAt;
    this.name = options.name;
    this.avatarURL = options.avatarURL;
    this.customData = options.customData;
    this.presenceState = new PresenceState('unknown');
  }

  updateWithPropertiesOfUser(user: User) {
    if (user.presenceState.stringValue !== 'unknown') {
      this.presenceState = user.presenceState;
      this.lastSeenAt = user.lastSeenAt;
    }

    return this;
  }

  updatePresenceInfoIfAppropriate(newInfoPayload: PresencePayload) {
    if (newInfoPayload.state.stringValue !== 'unknown') {
      this.presenceState = newInfoPayload.state;
      this.lastSeenAt = newInfoPayload.lastSeenAt;
    }
  }
}

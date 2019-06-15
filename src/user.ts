export interface BasicUser {
  avatarURL: string;
  createdAt: string;
  customData?: any;
  id: string;
  name: string;
  updatedAt: string;
}

export interface PresenceStore {
  [userId: string]: Presence;
}

export type Presence = "unknown" | "online" | "offline";

export class User implements BasicUser {
  public avatarURL: string;
  public createdAt: string;
  public customData?: any;
  public id: string;
  public name: string;
  public updatedAt: string;
  private presenceStore: PresenceStore;

  public constructor(basicUser: BasicUser, presenceStore: PresenceStore) {
    this.avatarURL = basicUser.avatarURL
    this.createdAt = basicUser.createdAt
    this.customData = basicUser.customData
    this.id = basicUser.id
    this.name = basicUser.name
    this.updatedAt = basicUser.updatedAt
    this.presenceStore = presenceStore
  }

  public get presence() {
    return {
      state: this.presenceStore[this.id] || "unknown",
    }
  }
}

import { contains, filter, values } from "ramda"
import { UserStore } from "./user-store";
import { Logger } from "@pusher/platform";

export interface BasicRoom {
  createdAt: string;
  createdByUserId: string;
  id: string;
  isPrivate: boolean;
  name: string;
  updatedAt: string;
  customData?: any;
  deletedAt: string;
  unreadCount: number;
  lastMessageAt: string;
}

export class Room {
  public createdAt: string;
  public createdByUserId: string;
  public id: string;
  public isPrivate: boolean;
  public name: string;
  public updatedAt: string;
  public customData?: any;
  public deletedAt: string;
  public unreadCount: number;
  public lastMessageAt: string;
  public userIds: string[];

  private userStore: UserStore;
  private isSubscribedTo: (userId: string) => boolean;
  private logger: Logger;

  public constructor({ basicRoom, userStore, isSubscribedTo, logger }: 
    {
      basicRoom: BasicRoom;
      userStore: UserStore;
      isSubscribedTo: (userId: string) => boolean;
      logger: Logger;
    }) {
    this.createdAt = basicRoom.createdAt
    this.createdByUserId = basicRoom.createdByUserId
    this.deletedAt = basicRoom.deletedAt
    this.id = basicRoom.id
    this.isPrivate = basicRoom.isPrivate
    this.name = basicRoom.name
    this.updatedAt = basicRoom.updatedAt
    this.customData = basicRoom.customData
    this.unreadCount = basicRoom.unreadCount
    this.lastMessageAt = basicRoom.lastMessageAt
    this.userIds = []
    this.userStore = userStore
    this.isSubscribedTo = isSubscribedTo
    this.logger = logger

    this.eq = this.eq.bind(this)
  }

  public get users() {
    if (!this.isSubscribedTo(this.id)) {
      const err = new Error(
        `Must be subscribed to room ${this.id} to access users property`,
      )
      this.logger.error(err)
      throw err
    }
    return filter(
      user => contains(user.id, this.userIds),
      values(this.userStore.snapshot()),
    )
  }

  public eq(other: Room) {
    return (
      this.createdAt === other.createdAt &&
      this.createdByUserId === other.createdByUserId &&
      this.deletedAt === other.deletedAt &&
      this.id === other.id &&
      this.isPrivate === other.isPrivate &&
      this.name === other.name &&
      this.updatedAt === other.updatedAt &&
      JSON.stringify(this.customData) === JSON.stringify(other.customData)
    )
  }
}

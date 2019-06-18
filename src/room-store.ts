import { append, uniq, pipe } from "ramda"

import { parseBasicRoom } from "./parsers"
import { Room, BasicRoom } from "./room"
import { Instance, Logger } from "@pusher/platform";
import { UserStore } from "./user-store";

type RoomUpdateData = Partial<BasicRoom & { userIds: string[]; }>;

export class RoomStore {
  private instance: Instance;
  private userStore: UserStore;
  private isSubscribedTo: (userId: string) => boolean
  private logger: Logger;
  private rooms: { [roomId: string]: Room}

  public constructor(options: {
    instance: Instance;
    userStore: UserStore;
    isSubscribedTo: (userId: string) => boolean;
    logger: Logger;
  }) {
    this.instance = options.instance
    this.userStore = options.userStore
    this.isSubscribedTo = options.isSubscribedTo
    this.logger = options.logger
    this.rooms = {}

    this.setSync = this.setSync.bind(this)
    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.popSync = this.popSync.bind(this)
    this.pop = this.pop.bind(this)
    this.addUserToRoom = this.addUserToRoom.bind(this)
    this.removeUserFromRoom = this.removeUserFromRoom.bind(this)
    this.updateSync = this.updateSync.bind(this)
    this.update = this.update.bind(this)
    this.fetchBasicRoom = this.fetchBasicRoom.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.getSync = this.getSync.bind(this)
    this.decorate = this.decorate.bind(this)
  }

  public setSync(basicRoom: BasicRoom) {
    if (!this.rooms[basicRoom.id]) {
      const room = this.decorate(basicRoom);
      room && (this.rooms[basicRoom.id] = room)
    }
    return this.rooms[basicRoom.id]
  }

  public set(basicRoom: BasicRoom) {
    return Promise.resolve(this.setSync(basicRoom))
  }

  public get(roomId: string) {
    return Promise.resolve(this.rooms[roomId]).then(
      room =>
        room ||
        this.fetchBasicRoom(roomId).then((basicRoom: BasicRoom) =>
          this.set(basicRoom),
        ),
    )
  }

  public popSync(roomId: string) {
    const room = this.rooms[roomId]
    delete this.rooms[roomId]
    return room
  }

  public pop(roomId: string) {
    return Promise.resolve(this.popSync(roomId))
  }

  public addUserToRoom(roomId: string, userId: string) {
    return Promise.all([
      this.get(roomId).then(room => {
        room.userIds = uniq(append(userId, room.userIds))
        return room
      }),
      this.userStore.fetchMissingUsers([userId]),
    ]).then(([room]) => room)
  }

  public removeUserFromRoom(roomId: string, userId: string) {
    return this.get(roomId).then(room => {
      room.userIds = room.userIds.filter(id => id !== userId)
      return room
    })
  }

  public updateSync(roomId: string, updates: RoomUpdateData) {
    const room = this.getSync(roomId)
    for (const k in updates) {
      room[k] = updates[k]
    }
    return room
  }

  public update(roomId: string, updates: RoomUpdateData) {
    return Promise.all([
      this.get(roomId).then(() => this.updateSync(roomId, updates)),
      this.userStore.fetchMissingUsers(updates.userIds || []),
    ]).then(([room]) => room)
  }

  private fetchBasicRoom(roomId: string) {
    return this.instance
      .request({
        method: "GET",
        path: `/rooms/${encodeURIComponent(roomId)}`,
      })
      .then(
        pipe(
          JSON.parse,
          parseBasicRoom,
        ),
      )
      .catch(err => {
        this.logger.warn(`error fetching details for room ${roomId}:`, err)
      })
  }

  public snapshot() {
    return this.rooms
  }

  public getSync(roomId: string) {
    return this.rooms[roomId]
  }

  private decorate(basicRoom?: BasicRoom): Room | undefined {
    return basicRoom
      ? new Room({
          basicRoom,
          userStore: this.userStore,
          isSubscribedTo: this.isSubscribedTo,
          logger: this.logger,
        })
      : undefined
  }
}

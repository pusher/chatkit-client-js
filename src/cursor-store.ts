import { Cursor, BasicCursor } from "./cursor"
import { parseBasicCursor } from "./parsers"
import { Instance, Logger } from "@pusher/platform";
import { UserStore } from "./user-store";
import { RoomStore } from "./room-store";

export class CursorStore {

  public instance: Instance;
  public userStore: UserStore;
  public roomStore: RoomStore;
  public logger: Logger;
  public cursors: { [key: string]: Cursor };

  public constructor({instance, userStore, roomStore, logger}: { 
    instance: Instance,
    userStore: UserStore,
    roomStore: RoomStore, 
    logger: Logger,
  }) {
    this.instance = instance
    this.userStore = userStore
    this.roomStore = roomStore
    this.logger = logger
    this.cursors = {}

    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.getSync = this.getSync.bind(this)
    this.fetchBasicCursor = this.fetchBasicCursor.bind(this)
    this.decorate = this.decorate.bind(this)
  }

  public set(basicCursor: BasicCursor) {
    const k = key(basicCursor.userId, basicCursor.roomId)
    this.cursors[k] = this.decorate(basicCursor)
    return this.userStore!
      .fetchMissingUsers([basicCursor.userId])
      .then(() => this.cursors[k])
  }

  public get(userId: string, roomId: string) {
    const k = key(userId, roomId)
    if (this.cursors[k]) {
      return Promise.resolve(this.cursors[k])
    }
    return this.fetchBasicCursor(userId, roomId).then(basicCursor =>
      this.set(basicCursor),
    )
  }

  public getSync(userId: string, roomId: string) {
    return this.cursors[key(userId, roomId)]
  }

  public fetchBasicCursor(userId: string, roomId: string) {
    return this.instance
      .request({
        method: "GET",
        path: `/cursors/0/rooms/${encodeURIComponent(
          roomId,
        )}/users/${encodeURIComponent(userId)}`,
      })
      .then(res => {
        const data = JSON.parse(res)
        if (data) {
          return parseBasicCursor(data)
        }
        return undefined
      })
      .catch(err => {
        this.logger.warn("error fetching cursor:", err)
        throw err
      })
  }

  public decorate(basicCursor: BasicCursor) {
    return basicCursor
      ? new Cursor(basicCursor, this.userStore, this.roomStore)
      : undefined
  }
}

const key = (userId: string, roomId: string) =>
  `${encodeURIComponent(userId)}/${encodeURIComponent(roomId)}`

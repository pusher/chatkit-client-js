import { BasicUser, User } from "./user";
import { BasicRoom, Room } from "./room";
import { BasicCursor, Cursor } from "./cursor";
import { CurrentUser } from "./current-user";
import { RoomStore } from "./room-store";
import { CursorStore } from "./cursor-store";
import { UserStore } from "./user-store";

export function handleUserSubReconnection(data: {
  basicUser: BasicUser,
  basicRooms: BasicRoom[],
  basicCursors: BasicCursor[],
  currentUser: CurrentUser,
  roomStore: RoomStore,
  cursorStore: CursorStore,
  hooks: { 
    global: {
      onAddedToRoom?: (room: BasicRoom) => void;
      onRemovedFromRoom?: (room: BasicRoom) => void;
      onRoomUpdated?: (room: BasicRoom) => void;
      onRoomDeleted?: (room: BasicRoom) => void;
      onNewReadCursor?: (cursor: BasicCursor) => void;
    }
  },
}) {
  data.currentUser.setPropertiesFromBasicUser(data.basicUser)

  for (const basicRoom of data.basicRooms) {
    const existingRoom = data.roomStore.getSync(basicRoom.id)

    if (!existingRoom) {
      const room = data.roomStore.setSync(basicRoom)
      if (data.hooks.global.onAddedToRoom) {
        data.hooks.global.onAddedToRoom(room)
      }
    }

    if (existingRoom && !existingRoom.eq(basicRoom)) {
      data.roomStore.updateSync(basicRoom.id, basicRoom)
      if (data.hooks.global.onRoomUpdated) {
        data.hooks.global.onRoomUpdated(existingRoom)
      }
    }
  }

  for (const roomId in data.roomStore.snapshot()) {
    if (!data.basicRooms.some(r => r.id === roomId)) {
      const room = data.roomStore.popSync(roomId)
      if (data.hooks.global.onRemovedFromRoom) {
        data.hooks.global.onRemovedFromRoom(room)
      }
    }
  }

  return handleCursorSubReconnection({
    basicCursors: data.basicCursors,
    cursorStore: data.cursorStore,
    onNewCursorHook: data.hooks.global.onNewReadCursor,
  })
}

export function handleMembershipSubReconnection(data: {
  userIds: string[],
  roomId: string,
  roomStore: RoomStore,
  userStore: UserStore,
  onUserJoinedRoomHook: (room: Room, user: User) => void,
  onUserLeftRoomHook: (room: Room, user: User) => void,
}) {
  return data.userStore.fetchMissingUsers(data.userIds).then(() => {
    const room = data.roomStore.getSync(data.roomId)

    data.userIds
      .filter(userId => !room.userIds.includes(userId))
      .forEach(userId =>
        data.userStore.get(userId).then(user => data.onUserJoinedRoomHook(room, user)),
      )

    room.userIds
      .filter(userId => !data.userIds.includes(userId))
      .forEach(userId =>
        data.userStore.get(userId).then(user => data.onUserLeftRoomHook(room, user)),
      )

    return data.roomStore.update(data.roomId, { userIds: data.userIds })
  })
}

export function handleCursorSubReconnection(data: {
  basicCursors: BasicCursor[],
  cursorStore: CursorStore,
  onNewCursorHook?: (cursor: Cursor) => void,
}) {
  return Promise.all(
    data.basicCursors.map(basicCursor => {
      const existingCursor = data.cursorStore.getSync(
        basicCursor.userId,
        basicCursor.roomId,
      )

      if (!existingCursor || existingCursor.position !== basicCursor.position) {
        return data.cursorStore.set(basicCursor).then(cursor => {
          if (data.onNewCursorHook) {
            data.onNewCursorHook(cursor)
          }
        })
      }
    }),
  )
}

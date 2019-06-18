import { BasicUser, User } from "./user";
import { BasicRoom, Room } from "./room";
import { BasicCursor, Cursor } from "./cursor";
import { CurrentUser } from "./current-user";
import { RoomStore } from "./room-store";
import { CursorStore } from "./cursor-store";
import { UserStore } from "./user-store";

export function handleUserSubReconnection({basicUser, basicRooms, basicCursors, currentUser, roomStore, cursorStore, hooks}: {
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
  currentUser.setPropertiesFromBasicUser(basicUser)

  for (const basicRoom of basicRooms) {
    const existingRoom = roomStore.getSync(basicRoom.id)

    if (!existingRoom) {
      const room = roomStore.setSync(basicRoom)
      if (hooks.global.onAddedToRoom) {
        hooks.global.onAddedToRoom(room)
      }
    }

    if (existingRoom && !existingRoom.eq(basicRoom)) {
      roomStore.updateSync(basicRoom.id, basicRoom)
      if (hooks.global.onRoomUpdated) {
        hooks.global.onRoomUpdated(existingRoom)
      }
    }
  }

  for (const roomId in roomStore.snapshot()) {
    if (!basicRooms.some(r => r.id === roomId)) {
      const room = roomStore.popSync(roomId)
      if (hooks.global.onRemovedFromRoom) {
        hooks.global.onRemovedFromRoom(room)
      }
    }
  }

  return handleCursorSubReconnection({
    basicCursors: basicCursors,
    cursorStore: cursorStore,
    onNewCursorHook: hooks.global.onNewReadCursor,
  })
}

export function handleMembershipSubReconnection({userIds, roomId, roomStore, userStore, onUserJoinedRoomHook, onUserLeftRoomHook}: {
  userIds: string[],
  roomId: string,
  roomStore: RoomStore,
  userStore: UserStore,
  onUserJoinedRoomHook: (room: Room, user: User) => void,
  onUserLeftRoomHook: (room: Room, user: User) => void,
}) {
  return userStore.fetchMissingUsers(userIds).then(() => {
    const room = roomStore.getSync(roomId)

    userIds
      .filter(userId => !room.userIds.includes(userId))
      .forEach(userId =>
        userStore.get(userId).then(user => onUserJoinedRoomHook(room, user)),
      )

    room.userIds
      .filter(userId => !userIds.includes(userId))
      .forEach(userId =>
        userStore.get(userId).then(user => onUserLeftRoomHook(room, user)),
      )

    return roomStore.update(roomId, { userIds })
  })
}

export function handleCursorSubReconnection({basicCursors, cursorStore, onNewCursorHook}: {
  basicCursors: BasicCursor[],
  cursorStore: CursorStore,
  onNewCursorHook?: (cursor: Cursor) => void,
}) {
  return Promise.all(
    basicCursors.map(basicCursor => {
      const existingCursor = cursorStore.getSync(
        basicCursor.userId,
        basicCursor.roomId,
      )

      if (!existingCursor || existingCursor.position !== basicCursor.position) {
        return cursorStore.set(basicCursor).then(cursor => {
          if (onNewCursorHook) {
            onNewCursorHook(cursor)
          }
        })
      }
    }),
  )
}

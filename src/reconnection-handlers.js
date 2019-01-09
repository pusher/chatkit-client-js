export function handleUserSubReconnection({
  basicUser,
  basicRooms,
  currentUser,
  roomStore,
  hooks,
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
}

export function handleMembershipSubReconnection({
  userIds,
  roomId,
  roomStore,
  userStore,
  hooks,
}) {
  userStore.fetchMissingUsers(userIds).then(() => {
    const room = roomStore.getSync(roomId)

    for (const userId of userIds.filter(
      userId => !room.userIds.includes(userId),
    )) {
      userStore.get(userId).then(user => {
        if (hooks.global.onUserJoinedRoom) {
          hooks.global.onUserJoinedRoom(room, user)
        }
        if (hooks.rooms[roomId] && hooks.rooms[roomId].onUserJoined) {
          hooks.rooms[roomId].onUserJoined(user)
        }
      })
    }

    for (const userId of room.userIds.filter(
      userId => !userIds.includes(userId),
    )) {
      userStore.get(userId).then(user => {
        if (hooks.global.onUserLeftRoom) {
          hooks.global.onUserLeftRoom(room, user)
        }
        if (hooks.rooms[roomId] && hooks.rooms[roomId].onUserLeft) {
          hooks.rooms[roomId].onUserLeft(user)
        }
      })
    }

    roomStore.update(roomId, { userIds })
  })
}

export function handleCursorSubReconnection({
  basicCursors,
  cursorStore,
  onNewCursorHook,
}) {
  for (const basicCursor of basicCursors) {
    const existingCursor = cursorStore.getSync(
      basicCursor.userId,
      basicCursor.roomId,
    )

    if (!existingCursor || existingCursor.position !== basicCursor) {
      cursorStore.set(basicCursor).then(cursor => onNewCursorHook(cursor))
    }
  }
}

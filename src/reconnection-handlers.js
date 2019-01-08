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

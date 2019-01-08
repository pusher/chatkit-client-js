import tape from "tape"

import { CurrentUser } from "../../src/current-user.js"
import { RoomStore } from "../../src/room-store.js"
import { handleUserSubReconnection } from "../../src/reconnection-handlers.js"
import { parseBasicRoom, parseBasicUser } from "../../src/parsers"

const TEST_TIMEOUT = 200

function test(name, f) {
  tape(name, t => {
    t.timeoutAfter(TEST_TIMEOUT)

    const currentUser = {
      name: "Callum",
      avatarURL: "old-avatar-url",
      customData: { foo: "bar" },
      createdAt: "old-created-at",
      updatedAt: "old-updated-at",
      setPropertiesFromBasicUser:
        CurrentUser.prototype.setPropertiesFromBasicUser,
    }

    const roomStore = new RoomStore({})
    roomStoreRooms.forEach(room => roomStore.set(parseBasicRoom(room)))
    f(t, currentUser, roomStore)
  })
}

const basicUser = parseBasicUser({
  name: "Callum",
  avatar_url: "new-avatar-url",
  custom_data: { baz: 42 },
  created_at: "new-created-at",
  updated_at: "new-updated-at",
})

const roomStoreRooms = [
  {
    id: "1",
    created_by_id: "ham",
    name: "one",
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "2",
    created_by_id: "ham",
    name: "two",
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "3",
    created_by_id: "ham",
    name: "three",
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "4",
    created_by_id: "ham",
    name: "four",
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "5",
    created_by_id: "ham",
    name: "five",
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "7",
    created_by_id: "ham",
    name: "seven",
    custom_data: { pre: "set", custom: "data" },
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "8",
    created_by_id: "ham",
    name: "eight",
    custom_data: { pre: "set" },
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "9",
    created_by_id: "ham",
    name: "nine",
    custom_data: { pre: "set" },
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
]

const roomsData = [
  {
    id: "1",
    created_by_id: "ham",
    name: "one",
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "3",
    created_by_id: "ham",
    name: "three",
    private: true,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "4",
    created_by_id: "ham",
    name: "four",
    private: false,
    custom_data: { set: "now" },
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "5",
    created_by_id: "ham",
    name: "5ive",
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "6",
    created_by_id: "ham",
    name: "size",
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "7",
    created_by_id: "ham",
    name: "seven",
    custom_data: { pre: "set", custom: "data", third: "field" },
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "8",
    created_by_id: "ham",
    name: "eight",
    private: false,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
  {
    id: "9",
    created_by_id: "ham",
    name: "9ine",
    custom_data: { pre: "set", and: "updated" },
    private: true,
    created_at: "2017-04-13T14:10:38Z",
    updated_at: "2017-04-13T14:10:38Z",
  },
]

const basicRooms = roomsData.map(d => parseBasicRoom(d))

test("room removed", (t, currentUser, roomStore) => {
  const onRemovedFromRoom = room => {
    if (room.id != "2") {
      return
    }
    t.equal(room.createdByUserId, "ham")
    t.equal(room.name, "two")
    t.equal(room.isPrivate, false)
    t.end()
  }

  handleUserSubReconnection({
    basicUser,
    basicRooms,
    currentUser,
    roomStore,
    hooks: { global: { onRemovedFromRoom } },
  })
})

test("privacy changed", (t, currentUser, roomStore) => {
  const onRoomUpdated = room => {
    if (room.id != "3") {
      return
    }
    t.equal(room.createdByUserId, "ham")
    t.equal(room.name, "three")
    t.equal(room.isPrivate, true)
    t.end()
  }

  handleUserSubReconnection({
    basicUser,
    basicRooms,
    currentUser,
    roomStore,
    hooks: { global: { onRoomUpdated } },
  })
})

test("custom data added", (t, currentUser, roomStore) => {
  const onRoomUpdated = room => {
    if (room.id != "4") {
      return
    }
    t.equal(room.createdByUserId, "ham")
    t.equal(room.name, "four")
    t.equal(room.isPrivate, false)
    t.deepEqual(room.customData, { set: "now" })
    t.end()
  }

  handleUserSubReconnection({
    basicUser,
    basicRooms,
    currentUser,
    roomStore,
    hooks: { global: { onRoomUpdated } },
  })
})

test("custom data updated", (t, currentUser, roomStore) => {
  const onRoomUpdated = room => {
    if (room.id != "7") {
      return
    }
    t.equal(room.createdByUserId, "ham")
    t.equal(room.name, "seven")
    t.equal(room.isPrivate, false)
    t.deepEqual(room.customData, { pre: "set", custom: "data", third: "field" })
    t.end()
  }

  handleUserSubReconnection({
    basicUser,
    basicRooms,
    currentUser,
    roomStore,
    hooks: { global: { onRoomUpdated } },
  })
})

test("custom data removed", (t, currentUser, roomStore) => {
  const onRoomUpdated = room => {
    if (room.id != "8") {
      return
    }
    t.equal(room.createdByUserId, "ham")
    t.equal(room.name, "eight")
    t.equal(room.isPrivate, false)
    t.equal(room.customData, undefined)
    t.end()
  }

  handleUserSubReconnection({
    basicUser,
    basicRooms,
    currentUser,
    roomStore,
    hooks: { global: { onRoomUpdated } },
  })
})

test("name changed", (t, currentUser, roomStore) => {
  const onRoomUpdated = room => {
    if (room.id != "5") {
      return
    }
    t.equal(room.createdByUserId, "ham")
    t.equal(room.name, "5ive")
    t.equal(room.isPrivate, false)
    t.end()
  }

  handleUserSubReconnection({
    basicUser,
    basicRooms,
    currentUser,
    roomStore,
    hooks: { global: { onRoomUpdated } },
  })
})

test(
  "multiple field changes (only one event!)",
  (t, currentUser, roomStore) => {
    let called = false

    const onRoomUpdated = room => {
      if (room.id != "9") {
        return
      }
      t.equal(room.createdByUserId, "ham")
      t.equal(room.name, "9ine")
      t.equal(room.isPrivate, true)
      t.deepEqual(room.customData, { pre: "set", and: "updated" })
      if (called) {
        t.end("onRoomUpdated called more than once")
        return
      }
      called = true
      setTimeout(() => t.end(), 100)
    }

    handleUserSubReconnection({
      basicUser,
      basicRooms,
      currentUser,
      roomStore,
      hooks: { global: { onRoomUpdated } },
    })
  },
)

test("room added", (t, currentUser, roomStore) => {
  const onAddedToRoom = room => {
    if (room.id != "6") {
      return
    }
    t.equal(room.createdByUserId, "ham")
    t.equal(room.name, "size")
    t.equal(room.isPrivate, false)
    t.end()
  }

  handleUserSubReconnection({
    basicUser,
    basicRooms,
    currentUser,
    roomStore,
    hooks: { global: { onAddedToRoom } },
  })
})

test("final state of room store", (t, currentUser, roomStore) => {
  handleUserSubReconnection({
    basicUser,
    basicRooms,
    currentUser,
    roomStore,
    hooks: { global: {} },
  })

  t.equal(basicRooms.length, Object.keys(roomStore.snapshot()).length)
  for (const basicRoom of basicRooms) {
    t.true(roomStore.getSync(basicRoom.id))
    t.true(roomStore.getSync(basicRoom.id).eq(basicRoom))
  }
  t.end()
})

test("current user changes", (t, currentUser, roomStore) => {
  handleUserSubReconnection({
    basicUser,
    basicRooms,
    currentUser,
    roomStore,
    hooks: { global: {} },
  })

  t.equal(currentUser.name, "Callum")
  t.equal(currentUser.avatarURL, "new-avatar-url")
  t.deepEqual(currentUser.customData, { baz: 42 })
  t.equal(currentUser.createdAt, "new-created-at")
  t.equal(currentUser.updatedAt, "new-updated-at")
  t.end()
})

import tape from "tape"

import { RoomStore } from "../../src/room-store.js"
import { UserStore } from "../../src/user-store.js"
import { handleMembershipSubReconnection } from "../../src/reconnection-handlers.js"

const TEST_TIMEOUT = 200

const roomId = "42"

const oldUserIds = ["callum", "mike", "alice"]
const newUserIds = ["callum", "mike", "bob"]

function test(name, f) {
  tape(name, t => {
    t.timeoutAfter(TEST_TIMEOUT)

    const userStore = new UserStore({})
    oldUserIds.forEach(id => userStore.set({ id, name: `user with id ${id}` }))
    newUserIds.forEach(id => userStore.set({ id, name: `user with id ${id}` }))
    const roomStore = new RoomStore({ userStore })
    roomStore
      .set({ id: roomId, name: "mushroom" })
      .then(() => roomStore.update(roomId, { userIds: oldUserIds }))
      .then(() => f(t, userStore, roomStore))
  })
}

test("user joined (room level hook)", (t, userStore, roomStore) => {
  const onUserJoined = user => {
    t.equal(user.id, "bob")
    t.equal(user.name, "user with id bob")
    t.end()
  }

  handleMembershipSubReconnection({
    userIds: newUserIds,
    roomId,
    roomStore,
    userStore,
    hooks: { rooms: { "42": { onUserJoined } }, global: {} },
  })
})

test("user joined (global hook)", (t, userStore, roomStore) => {
  const onUserJoinedRoom = (room, user) => {
    t.equal(room.id, roomId)
    t.equal(room.name, "mushroom")
    t.equal(user.id, "bob")
    t.equal(user.name, "user with id bob")
    t.end()
  }

  handleMembershipSubReconnection({
    userIds: newUserIds,
    roomId,
    roomStore,
    userStore,
    hooks: { rooms: {}, global: { onUserJoinedRoom } },
  })
})

test("user left (room level hook)", (t, userStore, roomStore) => {
  const onUserLeft = user => {
    t.equal(user.id, "alice")
    t.equal(user.name, "user with id alice")
    t.end()
  }

  handleMembershipSubReconnection({
    userIds: newUserIds,
    roomId,
    roomStore,
    userStore,
    hooks: { rooms: { "42": { onUserLeft } }, global: {} },
  })
})

test("user joined (global hook)", (t, userStore, roomStore) => {
  const onUserLeftRoom = (room, user) => {
    t.equal(room.id, roomId)
    t.equal(room.name, "mushroom")
    t.equal(user.id, "alice")
    t.equal(user.name, "user with id alice")
    t.end()
  }

  handleMembershipSubReconnection({
    userIds: newUserIds,
    roomId,
    roomStore,
    userStore,
    hooks: { rooms: {}, global: { onUserLeftRoom } },
  })
})

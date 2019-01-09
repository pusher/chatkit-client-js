import tape from "tape"

import { CursorStore } from "../../src/cursor-store.js"
import { UserStore } from "../../src/user-store.js"
import { handleCursorSubReconnection } from "../../src/reconnection-handlers.js"
import { parseBasicCursor } from "../../src/parsers.js"

const TEST_TIMEOUT = 200

const oldCursors = [
  {
    cursor_type: 0,
    room_id: "1",
    user_id: "callum",
    position: 1,
    updated_at: "2017-11-29T16:59:58Z",
  },
  {
    cursor_type: 0,
    room_id: "2",
    user_id: "callum",
    position: 2,
    updated_at: "2017-11-29T16:59:58Z",
  },
  {
    cursor_type: 0,
    room_id: "1",
    user_id: "mike",
    position: 2,
    updated_at: "2017-11-29T16:59:58Z",
  },
].map(c => parseBasicCursor(c))

const newUserCursors = [
  {
    cursor_type: 0,
    room_id: "1",
    user_id: "callum",
    position: 1,
    updated_at: "2017-11-29T16:59:58Z",
  },
  {
    cursor_type: 0,
    room_id: "2",
    user_id: "callum",
    position: 3,
    updated_at: "2017-11-29T16:59:58Z",
  },
  {
    cursor_type: 0,
    room_id: "3",
    user_id: "callum",
    position: 4,
    updated_at: "2017-11-29T16:59:58Z",
  },
].map(c => parseBasicCursor(c))

const newRoomCursors = [
  {
    cursor_type: 0,
    room_id: "1",
    user_id: "callum",
    position: 1,
    updated_at: "2017-11-29T16:59:58Z",
  },
  {
    cursor_type: 0,
    room_id: "1",
    user_id: "mike",
    position: 3,
    updated_at: "2017-11-29T16:59:58Z",
  },
  {
    cursor_type: 0,
    room_id: "1",
    user_id: "viv",
    position: 3,
    updated_at: "2017-11-29T16:59:58Z",
  },
].map(c => parseBasicCursor(c))

function test(name, f) {
  tape(name, t => {
    t.timeoutAfter(TEST_TIMEOUT)

    const userStore = new UserStore({})
    const cursorStore = new CursorStore({ userStore })
    Promise.all(
      ["callum", "mike", "viv"].map(id =>
        userStore.set({ id, name: `user with id ${id}` }),
      ),
    )
      .then(() => Promise.all(oldCursors.map(c => cursorStore.set(c))))
      .then(() => f(t, cursorStore))
  })
}

test("updated (user)", (t, cursorStore) => {
  const onNewCursorHook = cursor => {
    if (cursor.roomId !== "2") {
      return
    }

    t.equal(cursor.type, 0)
    t.equal(cursor.userId, "callum")
    t.equal(cursor.position, 3)
    t.end()
  }

  handleCursorSubReconnection({
    basicCursors: newUserCursors,
    cursorStore,
    onNewCursorHook,
  })
})

test("new (user)", (t, cursorStore) => {
  const onNewCursorHook = cursor => {
    if (cursor.roomId !== "3") {
      return
    }

    t.equal(cursor.type, 0)
    t.equal(cursor.userId, "callum")
    t.equal(cursor.position, 4)
    t.end()
  }

  handleCursorSubReconnection({
    basicCursors: newUserCursors,
    cursorStore,
    onNewCursorHook,
  })
})

test("updated (room)", (t, cursorStore) => {
  const onNewCursorHook = cursor => {
    if (cursor.userId !== "mike") {
      return
    }

    t.equal(cursor.type, 0)
    t.equal(cursor.roomId, "1")
    t.equal(cursor.position, 3)
    t.end()
  }

  handleCursorSubReconnection({
    basicCursors: newRoomCursors,
    cursorStore,
    onNewCursorHook,
  })
})

test("new (room)", (t, cursorStore) => {
  const onNewCursorHook = cursor => {
    if (cursor.userId !== "viv") {
      return
    }

    t.equal(cursor.type, 0)
    t.equal(cursor.roomId, "1")
    t.equal(cursor.position, 3)
    t.end()
  }

  handleCursorSubReconnection({
    basicCursors: newRoomCursors,
    cursorStore,
    onNewCursorHook,
  })
})

// TODO test state of cursor sub

/* eslint-env browser */

import test from "tape"
import {
  any,
  compose,
  concat,
  contains,
  curry,
  find,
  length,
  map,
  reduce,
  toString,
} from "ramda"

import ChatkitServer from "@pusher/chatkit-server"
/* eslint-disable import/no-duplicates */
import { TokenProvider, ChatManager } from "../../dist/web/chatkit.js"
import Chatkit from "../../dist/web/chatkit.js"
/* eslint-enable import/no-duplicates */
import {
  INSTANCE_LOCATOR,
  INSTANCE_KEY,
  TOKEN_PROVIDER_URL,
} from "./config/production"

let alicesRoom, bobsRoom, carolsRoom, alicesPrivateRoom
let bob, carol

const TEST_TIMEOUT = 15 * 1000
// Tests that involve presence subscriptions require a slightly longer timeout
// due to the nature of how presence updates are delivered.
const PRESENCE_TEST_TIMEOUT = 25 * 1000

const server = new ChatkitServer({
  instanceLocator: INSTANCE_LOCATOR,
  key: INSTANCE_KEY,
})

// batch(n, f) returns a function that on each call collects its arguments in
// an array until it has been called n times, then calls f with the resulting
// array. Subsequent calls do nothing.
// e.g.
//
//     const logAfterThreeCalls = batch(3, console.log)
//     logAfterThreeCalls(1, 2)
//     logAfterThreeCalls(3, 4, 5)
//     logAfterThreeCalls(6)
//
// logs on the third call
//
//     [[1, 2], [3, 4, 5], [6]]
//
const batch = (n, f) => {
  const calls = []
  return (...args) => {
    if (n-- > 0) {
      calls.push(args)
    }
    if (n === 0) {
      f(calls)
    }
  }
}

const concatBatch = (n, f) =>
  batch(
    n,
    compose(
      f,
      reduce(concat, []),
    ),
  )

const fetchUser = (t, userId, hooks = {}) =>
  new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId,
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL }),
    logger: {
      error: console.log, // eslint-disable-line no-console
      warn: console.log, // eslint-disable-line no-console
      info: () => {},
      debug: () => {},
      verbose: () => {},
    },
  })
    .connect(hooks)
    .catch(endWithErr(t))

const endWithErr = curry((t, err) => t.end(`error: ${toString(err)}`))

// Teardown first so that we can kill the tests at any time, safe in the
// knowledge that we'll always be starting with a blank slate next time

test("[teardown]", t => {
  server
    .apiRequest({
      method: "DELETE",
      path: "/resources",
      jwt: server.generateAccessToken({ userId: "admin", su: true }).token,
    })
    .then(() => t.end())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT * 10)
})

test("[setup] create permissions", t => {
  Promise.all([
    server.createGlobalRole({
      name: "default",
      permissions: [
        "message:create",
        "room:join",
        "room:leave",
        "room:members:add",
        "room:members:remove",
        "room:get",
        "room:create",
        "room:messages:get",
        "room:typing_indicator:create",
        "presence:subscribe",
        "user:get",
        "user:rooms:get",
        "file:get",
        "file:create",
        "cursors:read:get",
        "cursors:read:set",
      ],
    }),
    server.createGlobalRole({
      name: "admin",
      permissions: [
        "message:create",
        "room:join",
        "room:leave",
        "room:members:add",
        "room:members:remove",
        "room:get",
        "room:create",
        "room:messages:get",
        "room:typing_indicator:create",
        "presence:subscribe",
        "user:get",
        "user:rooms:get",
        "file:get",
        "file:create",
        "cursors:read:get",
        "cursors:read:set",
        "room:delete",
        "room:update",
      ],
    }),
  ])
    .then(() => t.end())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT * 10)
})

// Imports

test("can import TokenProvider", t => {
  t.equal(typeof TokenProvider, "function")
  t.end()
})

test("can import ChatManager", t => {
  t.equal(typeof ChatManager, "function")
  t.end()
})

test("can import default", t => {
  t.equal(typeof Chatkit, "object")
  t.equal(typeof Chatkit.TokenProvider, "function")
  t.equal(typeof Chatkit.ChatManager, "function")
  t.end()
})

// Token provider

test("instantiate TokenProvider with url", t => {
  const tokenProvider = new TokenProvider({ url: TOKEN_PROVIDER_URL })
  t.equal(typeof tokenProvider, "object")
  t.equal(typeof tokenProvider.fetchToken, "function")
  t.end()
})

test("instantiate TokenProvider with non-string url fails", t => {
  t.throws(() => new TokenProvider({ url: 42 }), /url/)
  t.end()
})

// Chat manager

test("instantiate ChatManager with correct params", t => {
  const chatManager = new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId: "alice",
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL }),
  })
  t.equal(typeof chatManager, "object")
  t.equal(typeof chatManager.connect, "function")
  t.end()
})

test("instantiate ChatManager with non-string instanceLocator fails", t => {
  t.throws(
    () =>
      new ChatManager({
        instanceLocator: 42,
        userId: "alice",
        tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL }),
      }),
    /instanceLocator/,
  )
  t.end()
})

test("instantiate ChatManager without userId fails", t => {
  t.throws(
    () =>
      new ChatManager({
        instanceLocator: INSTANCE_LOCATOR,
        userId: 42,
        tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL }),
      }),
    /userId/,
  )
  t.end()
})

test("instantiate ChatManager with non-string userId fails", t => {
  t.throws(
    () =>
      new ChatManager({
        instanceLocator: INSTANCE_LOCATOR,
        userId: 42,
        tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL }),
      }),
    /string/,
  )
  t.end()
})

test("instantiate ChatManager with non tokenProvider fails", t => {
  t.throws(
    () =>
      new ChatManager({
        instanceLocator: INSTANCE_LOCATOR,
        userId: 42,
        tokenProvider: { foo: "bar" },
      }),
    /tokenProvider/,
  )
  t.end()
})

test("connection fails if provided with non-function hooks", t => {
  const chatManager = new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId: "alice",
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL }),
  })
  t.throws(() => chatManager.connect({ nonFunction: 42 }), /nonFunction/)
  t.end()
})

test("connection fails for nonexistent user", t => {
  const chatManager = new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId: "alice",
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL }),
  })
  chatManager
    .connect()
    .then(() => {
      t.end("promise should not resolve")
    })
    .catch(err => {
      t.true(
        toString(err).match(/user does not exist/),
        "user does not exist error",
      )
      t.end()
    })
  t.timeoutAfter(TEST_TIMEOUT)
})

test("[setup] create Alice", t => {
  server
    .createUser({ id: "alice", name: "Alice" })
    .then(() => server.createRoom({ creatorId: "alice", name: `Alice's room` }))
    .then(room => {
      alicesRoom = room // we'll want this in the following tests
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("connection resolves with current user object", t => {
  fetchUser(t, "alice")
    .then(alice => {
      t.equal(typeof alice, "object")
      t.equal(alice.id, "alice")
      t.equal(alice.name, "Alice")
      t.true(Array.isArray(alice.rooms), "alice.rooms is an array")
      t.equal(length(alice.rooms), 1)
      t.equal(alice.rooms[0].name, `Alice's room`)
      t.equal(alice.rooms[0].isPrivate, false)
      t.equal(alice.rooms[0].createdByUserId, "alice")
      alice.disconnect()
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

// User subscription

test("own read cursor undefined if not set", t => {
  fetchUser(t, "alice")
    .then(alice => {
      t.equal(alice.readCursor({ roomId: alicesRoom.id }), undefined)
      alice.disconnect()
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("new read cursor hook [Alice sets her read cursor in her room]", t => {
  let mobileAlice, browserAlice
  Promise.all([
    fetchUser(t, "alice"),
    fetchUser(t, "alice", {
      onNewReadCursor: cursor => {
        t.equal(cursor.position, 42)
        t.equal(cursor.user.name, "Alice")
        t.equal(cursor.room.name, `Alice's room`)
        mobileAlice.disconnect()
        browserAlice.disconnect()
        t.end()
      },
    }),
  ])
    .then(([m, b]) => {
      mobileAlice = m
      browserAlice = b
      mobileAlice.setReadCursor({ roomId: alicesRoom.id, position: 42 })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("get own read cursor", t => {
  fetchUser(t, "alice")
    .then(alice => {
      const cursor = alice.readCursor({ roomId: alicesRoom.id })
      t.equal(cursor.position, 42)
      t.equal(cursor.user.name, "Alice")
      t.equal(cursor.room.name, `Alice's room`)
      alice.disconnect()
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`added to room hook [creates Bob & Bob's room]`, t => {
  let alice
  fetchUser(t, "alice", {
    onAddedToRoom: room => {
      t.equal(room.name, `Bob's room`)
      t.true(
        any(r => r.id === room.id, alice.rooms),
        `should contain Bob's room`,
      )
      const br = find(r => r.id === room.id, alice.rooms)
      t.true(br, `alice.rooms should contain Bob's room`)
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
    })
    .then(() => server.createUser({ id: "bob", name: "Bob" }))
    .then(() =>
      server.createRoom({
        creatorId: "bob",
        name: `Bob's room`,
        userIds: ["alice"],
      }),
    )
    .then(room => {
      bobsRoom = room // we'll want this in the following tests
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

// Presence Subscription

test("current user is online", t => {
  fetchUser(t, "alice", {})
    .then(alice => {
      const myUser = alice.users.find(u => u.id === "alice")
      t.false(myUser === undefined)
      t.equal(myUser.presence.state, "online")
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("user came online hook (presence sub)", t => {
  let alice
  fetchUser(t, "alice", {
    onPresenceChanged: (state, user) => {
      if (user.id === "alice") {
        return // ignore our own updates
      }

      if (state.current === "offline") {
        return // ignore if we get a cached value of offline
      }

      t.equal(state.current, "online")
      t.equal(user.id, "bob")
      t.equal(user.presence.state, "online")

      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
    })
    .then(() => alice.subscribeToRoom({ roomId: bobsRoom.id }))
    .then(() => fetchUser(t, "bob"))
    .then(b => {
      bob = b
    })
    .catch(endWithErr(t))
  t.timeoutAfter(PRESENCE_TEST_TIMEOUT)
})

test("user went offline hook (presence sub)", t => {
  let alice
  fetchUser(t, "alice", {
    onPresenceChanged: (state, user) => {
      if (state.previous === "unknown") {
        return // ignore the initial state, we only care about the transition
      }
      if (user.id === "alice") {
        return // ignore our own updates
      }

      t.equal(state.current, "offline")
      t.equal(state.previous, "online")
      t.equal(user.id, "bob")
      t.equal(user.presence.state, "offline")

      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
    })
    .then(() => alice.subscribeToRoom({ roomId: bobsRoom.id }))
    .then(() => bob.disconnect())
    .catch(endWithErr(t))
  t.timeoutAfter(PRESENCE_TEST_TIMEOUT)
})

test("user left room hook (user sub) [removes Bob from his own room]", t => {
  let alice
  fetchUser(t, "alice", {
    onUserLeftRoom: (room, user) => {
      t.equal(room.id, bobsRoom.id)
      t.equal(user.id, "bob")
      t.deepEqual(room.users.map(u => u.name), ["Alice"])
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
    })
    .then(() => alice.subscribeToRoom({ roomId: bobsRoom.id }))
    .then(() => {
      server.apiRequest({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(bobsRoom.id)}/users/remove`,
        body: { user_ids: ["bob"] },
        jwt: server.generateAccessToken({ userId: "admin", su: true }).token,
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("user joined room hook (user sub) [Bob rejoins his own room]", t => {
  let alice
  fetchUser(t, "alice", {
    onUserJoinedRoom: (room, user) => {
      t.equal(user.id, "bob")
      t.equal(room.id, bobsRoom.id)
      t.true(contains("bob", room.userIds), `bob's room updated`)
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
    })
    .then(() => alice.subscribeToRoom({ roomId: bobsRoom.id }))
    .then(() => {
      bobsRoom = find(r => r.id === bobsRoom.id, alice.rooms)
      server.apiRequest({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(bobsRoom.id)}/users/add`,
        body: { user_ids: ["bob"] },
        jwt: server.generateAccessToken({ userId: "admin", su: true }).token,
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("room updated hook", t => {
  let alice
  fetchUser(t, "alice", {
    onRoomUpdated: room => {
      t.equal(room.id, bobsRoom.id)
      t.equal(room.name, `Bob's renamed room`)
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
      server.apiRequest({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(bobsRoom.id)}`,
        body: { name: `Bob's renamed room` },
        jwt: server.generateAccessToken({ userId: "admin", su: true }).token,
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`removed from room hook [removes Alice from Bob's room]`, t => {
  let alice
  fetchUser(t, "alice", {
    onRemovedFromRoom: room => {
      t.equal(room.id, bobsRoom.id)
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
      server.apiRequest({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(bobsRoom.id)}/users/remove`,
        body: { user_ids: ["alice"] },
        jwt: server.generateAccessToken({ userId: "admin", su: true }).token,
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`room deleted hook [destroys Alice's room]`, t => {
  let alice
  fetchUser(t, "alice", {
    onRoomDeleted: room => {
      t.equal(room.id, alicesRoom.id)
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
      server.apiRequest({
        method: "DELETE",
        path: `/rooms/${alicesRoom.id}`,
        jwt: server.generateAccessToken({ userId: "admin", su: true }).token,
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`create room [creates Alice's new room]`, t => {
  let alice
  fetchUser(t, "alice")
    .then(a => {
      alice = a
      const result = alice.createRoom({
        name: `Alice's new room`,
        customData: { foo: 42 },
      })
      return result
    })
    .then(room => {
      alicesRoom = room
      t.equal(room.name, `Alice's new room`)
      t.false(room.isPrivate, `room shouldn't be private`)
      t.equal(room.createdByUserId, "alice")
      alice.subscribeToRoom({ roomId: room.id }).then(() => {
        t.deepEqual(room.userIds, ["alice"])
        t.deepEqual(room.users.map(u => u.name), ["Alice"])
        t.deepEqual(room.customData, { foo: 42 })
        alice.disconnect()
        t.end()
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`create private room [creates Alice's private room]`, t => {
  let alice
  fetchUser(t, "alice")
    .then(a => {
      alice = a
      const result = alice.createRoom({
        name: `Alice's private room`,
        private: true,
      })
      return result
    })
    .then(room => {
      alicesPrivateRoom = room
      t.equal(room.name, `Alice's private room`)
      t.true(room.isPrivate, "room should be private")
      t.equal(room.createdByUserId, "alice")
      alice.subscribeToRoom({ roomId: room.id }).then(() => {
        t.deepEqual(room.userIds, ["alice"])
        t.deepEqual(room.users.map(u => u.name), ["Alice"])
        alice.disconnect()
        t.end()
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`create room with members [creates Bob's new room]`, t => {
  let bob
  fetchUser(t, "bob")
    .then(b => {
      bob = b
      const result = bob.createRoom({
        name: `Bob's new room`,
        addUserIds: ["alice"],
      })
      return result
    })
    .then(room => {
      bobsRoom = room
      t.equal(room.name, `Bob's new room`)
      t.false(room.isPrivate, `room shouldn't be private`)
      t.equal(room.createdByUserId, "bob")
      bob.subscribeToRoom({ roomId: room.id }).then(() => {
        t.deepEqual(room.userIds.sort(), ["alice", "bob"])
        t.deepEqual(room.users.map(u => u.name).sort(), ["Alice", "Bob"])
        bob.disconnect()
        t.end()
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("get joined rooms", t => {
  const expectedRoomIds = [alicesRoom, bobsRoom, alicesPrivateRoom]
    .map(r => r.id)
    .sort()
  fetchUser(t, "alice")
    .then(alice => {
      t.deepEqual(map(r => r.id, alice.rooms).sort(), expectedRoomIds)
      alice.disconnect()
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("get joinable rooms", t => {
  fetchUser(t, "bob")
    .then(bob => {
      const result = bob.getJoinableRooms()
      bob.disconnect()
      return result
    })
    .then(rooms => {
      const ids = rooms.map(r => r.id)
      t.true(ids.includes(alicesRoom.id), `should include Alice's room`)
      t.false(ids.includes(bobsRoom.id), `shouldn't include Bob's room`)
      t.false(
        ids.includes(alicesPrivateRoom.id),
        `shouldn't include Alice's private room`,
      )
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`join room [Bob joins Alice's room]`, t => {
  fetchUser(t, "bob")
    .then(bob =>
      bob.joinRoom({ roomId: alicesRoom.id }).then(room => {
        bob.subscribeToRoom({ roomId: room.id }).then(() => {
          t.equal(room.id, alicesRoom.id)
          t.equal(room.createdByUserId, "alice")
          t.true(
            any(r => r.id === alicesRoom.id, bob.rooms),
            `should include Alice's room`,
          )
          t.deepEqual(room.userIds.sort(), ["alice", "bob"])
          t.deepEqual(room.users.map(u => u.name).sort(), ["Alice", "Bob"])
          bob.disconnect()
          t.end()
        })
      }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`leave room [Bob leaves Alice's room]`, t => {
  let done
  fetchUser(t, "bob", {
    onRemovedFromRoom: room => {
      if (done) {
        return // FIXME we shouldn't need this. I guess disconnect is not synchronous?
      }
      done = true
      t.equal(room.id, alicesRoom.id)
      t.false(
        any(r => r.id === alicesRoom.id, bob.rooms),
        `shouldn't include Alice's room`,
      )
      bob.disconnect()
      t.end()
    },
  })
    .then(bob => {
      t.true(
        any(r => r.id === alicesRoom.id, bob.rooms),
        `should include Bob's room`,
      )
      return bob.leaveRoom({ roomId: alicesRoom.id }).then(room => {
        t.equal(room.id, alicesRoom.id)
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("add user [Alice adds Bob to her room]", t => {
  fetchUser(t, "alice").then(alice =>
    alice
      .addUserToRoom({
        userId: "bob",
        roomId: alicesRoom.id,
      })
      .then(() => {
        const room = find(r => r.id === alicesRoom.id, alice.rooms)
        alice.subscribeToRoom({ roomId: room.id }).then(() => {
          t.deepEqual(room.userIds.sort(), ["alice", "bob"])
          t.deepEqual(room.users.map(u => u.name).sort(), ["Alice", "Bob"])
          alice.disconnect()
          t.end()
        })
      })
      .catch(endWithErr(t)),
  )
  t.timeoutAfter(TEST_TIMEOUT)
})

test("remove user [Alice removes Bob from her room]", t => {
  fetchUser(t, "alice").then(alice =>
    alice
      .removeUserFromRoom({
        userId: "bob",
        roomId: alicesRoom.id,
      })
      .then(() => {
        const room = find(r => r.id === alicesRoom.id, alice.rooms)
        alice.subscribeToRoom({ roomId: room.id }).then(() => {
          t.deepEqual(room.userIds.sort(), ["alice"])
          t.deepEqual(room.users.map(u => u.name), ["Alice"])
          alice.disconnect()
          t.end()
        })
      })
      .catch(endWithErr(t)),
  )
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`send messages [sends two messages to Bob's room]`, t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .sendMessage({ roomId: bobsRoom.id, text: "hello" })
        .then(() => alice.sendMessage({ roomId: bobsRoom.id, text: "hey" }))
        .then(() => alice.disconnect()),
    )
    .then(t.end)
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`send simple messages (v3) [sends two messages to Bob's room]`, t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .sendMessage({ roomId: bobsRoom.id, text: "hi" })
        .then(() => alice.sendMessage({ roomId: bobsRoom.id, text: "ho" }))
        .then(() => alice.disconnect()),
    )
    .then(t.end)
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("fetch messages", t => {
  let alice
  fetchUser(t, "alice")
    .then(a => {
      alice = a
      return alice.fetchMessages({ roomId: bobsRoom.id })
    })
    .then(messages => {
      t.deepEqual(messages.map(m => m.text), ["hello", "hey", "hi", "ho"])
      t.equal(messages[0].sender.id, "alice")
      t.equal(messages[0].sender.name, "Alice")
      t.equal(messages[0].room.id, bobsRoom.id)
      t.equal(messages[0].room.name, bobsRoom.name)
      alice.disconnect()
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("fetch multipart messages", t => {
  let alice
  fetchUser(t, "alice")
    .then(a => {
      alice = a
      return alice.fetchMultipartMessages({ roomId: bobsRoom.id })
    })
    .then(messages => {
      t.deepEqual(messages.map(m => m.parts[0].payload.content), [
        "hello",
        "hey",
        "hi",
        "ho",
      ])
      t.equal(messages[0].sender.id, "alice")
      t.equal(messages[0].sender.name, "Alice")
      t.equal(messages[0].room.id, bobsRoom.id)
      t.equal(messages[0].room.name, bobsRoom.name)
      alice.disconnect()
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("fetch messages with pagination", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .fetchMessages({ roomId: bobsRoom.id, limit: 2 })
        .then(messages => {
          t.deepEqual(messages.map(m => m.text), ["hi", "ho"])
          return messages[0].id
        })
        .then(initialId =>
          alice.fetchMessages({
            roomId: bobsRoom.id,
            initialId,
          }),
        )
        .then(messages => {
          t.deepEqual(messages.map(m => m.text), ["hello", "hey"])
          alice.disconnect()
          t.end()
        }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("fetch multipart messages with pagination", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .fetchMultipartMessages({ roomId: bobsRoom.id, limit: 2 })
        .then(messages => {
          t.deepEqual(messages.map(m => m.parts[0].payload.content), [
            "hi",
            "ho",
          ])
          return messages[0].id
        })
        .then(initialId =>
          alice.fetchMultipartMessages({
            roomId: bobsRoom.id,
            initialId,
          }),
        )
        .then(messages => {
          t.deepEqual(messages.map(m => m.parts[0].payload.content), [
            "hello",
            "hey",
          ])
          alice.disconnect()
          t.end()
        }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to room and fetch initial messages", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice.subscribeToRoom({
        roomId: bobsRoom.id,
        hooks: {
          onMessage: concatBatch(4, messages => {
            t.deepEqual(map(m => m.text, messages), [
              "hello",
              "hey",
              "hi",
              "ho",
            ])
            t.equal(messages[0].sender.name, "Alice")
            t.equal(messages[0].room.name, `Bob's new room`)
            alice.disconnect()
            t.end()
          }),
        },
      }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to room and fetch initial messages (v3)", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice.subscribeToRoomMultipart({
        roomId: bobsRoom.id,
        hooks: {
          onMessage: concatBatch(4, messages => {
            messages.forEach(m => {
              t.equal(m.sender.name, "Alice")
              t.equal(m.room.name, `Bob's new room`)
              t.equal(m.parts.length, 1)
              t.equal(m.parts[0].partType, "inline")
              t.equal(m.parts[0].payload.type, "text/plain")
            })
            t.deepEqual(messages.map(m => m.parts[0].payload.content), [
              "hello",
              "hey",
              "hi",
              "ho",
            ])
            alice.disconnect()
            t.end()
          }),
        },
      }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to room and fetch last two message only", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice.subscribeToRoom({
        roomId: bobsRoom.id,
        hooks: {
          onMessage: concatBatch(2, messages => {
            t.deepEqual(map(m => m.text, messages), ["hi", "ho"])
            alice.disconnect()
            t.end()
          }),
        },
        messageLimit: 2,
      }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to room and fetch last two message only (v3)", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice.subscribeToRoomMultipart({
        roomId: bobsRoom.id,
        hooks: {
          onMessage: concatBatch(2, messages => {
            messages.forEach(m => {
              t.equal(m.sender.name, "Alice")
              t.equal(m.room.name, `Bob's new room`)
              t.equal(m.parts.length, 1)
              t.equal(m.parts[0].partType, "inline")
              t.equal(m.parts[0].payload.type, "text/plain")
            })
            t.deepEqual(messages.map(m => m.parts[0].payload.content), [
              "hi",
              "ho",
            ])
            alice.disconnect()
            t.end()
          }),
        },
        messageLimit: 2,
      }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to room and receive sent messages (v2 sends, v2 receives)", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .subscribeToRoom({
          roomId: bobsRoom.id,
          hooks: {
            onMessage: concatBatch(3, messages => {
              t.equal(messages[0].text, "yo")
              t.equal(messages[0].sender.name, "Alice")
              t.equal(messages[0].room.name, `Bob's new room`)

              t.equal(messages[1].text, "yoo")
              t.equal(messages[1].sender.name, "Alice")
              t.equal(messages[1].room.name, `Bob's new room`)
              t.equal(typeof messages[1].attachment, "object")
              t.equal(messages[1].attachment.type, "image")
              t.equal(messages[1].attachment.name, "cat")
              t.equal(messages[1].attachment.link, "https://cataas.com/cat")

              t.equal(messages[2].text, "yooo")
              t.equal(messages[2].sender.name, "Alice")
              t.equal(messages[2].room.name, `Bob's new room`)
              t.equal(messages[2].attachment.type, "file")
              t.equal(messages[2].attachment.name, "file: with spaces.json")
              fetch(messages[2].attachment.link)
                .then(res => res.json())
                .then(data => {
                  t.deepEqual(data, { hello: "world" })
                  alice.disconnect()
                  t.end()
                })
            }),
          },
          messageLimit: 0,
        })
        .then(() => alice.sendMessage({ roomId: bobsRoom.id, text: "yo" }))
        .then(() =>
          alice.sendMessage({
            roomId: bobsRoom.id,
            text: "yoo",
            attachment: {
              link: "https://cataas.com/cat",
              type: "image",
            },
          }),
        )
        .then(() =>
          alice.sendMessage({
            roomId: bobsRoom.id,
            text: "yooo",

            attachment: {
              file: new File(
                [JSON.stringify({ hello: "world" })],
                "file: with spaces.json",
                {
                  type: "application/json",
                },
              ),
              name: "file: with spaces.json",
            },
          }),
        ),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to room and receive sent messages (v3 sends, v2 receives)", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .subscribeToRoom({
          roomId: bobsRoom.id,
          hooks: {
            onMessage: concatBatch(3, messages => {
              t.equal(messages[0].text, "yo2")
              t.equal(messages[0].sender.name, "Alice")
              t.equal(messages[0].room.name, `Bob's new room`)

              t.equal(messages[1].text, "yoo2")
              t.equal(messages[1].sender.name, "Alice")
              t.equal(messages[1].room.name, `Bob's new room`)
              t.equal(typeof messages[1].attachment, "object")
              t.equal(messages[1].attachment.type, "image")
              t.equal(messages[1].attachment.name, "cat")
              t.equal(messages[1].attachment.link, "https://cataas.com/cat")

              t.equal(messages[2].text, "yooo2")
              t.equal(messages[2].sender.name, "Alice")
              t.equal(messages[2].room.name, `Bob's new room`)
              t.equal(messages[2].attachment.type, "file")
              t.equal(messages[2].attachment.name, "file: with spaces.json")
              fetch(messages[2].attachment.link)
                .then(res => res.json())
                .then(data => {
                  t.deepEqual(data, { hello: "world" })
                  alice.disconnect()
                  t.end()
                })
            }),
          },
          messageLimit: 0,
        })
        .then(() =>
          alice.sendSimpleMessage({ roomId: bobsRoom.id, text: "yo2" }),
        )
        .then(() =>
          alice.sendMultipartMessage({
            roomId: bobsRoom.id,
            parts: [
              { type: "text/plain", content: "yoo2" },
              { type: "image/cat", url: "https://cataas.com/cat" },
            ],
          }),
        )
        .then(() =>
          alice.sendMultipartMessage({
            roomId: bobsRoom.id,
            parts: [
              { type: "text/plain", content: "yooo2" },
              {
                file: new File(
                  [JSON.stringify({ hello: "world" })],
                  "file: with spaces.json",
                  {
                    type: "application/json",
                  },
                ),
              },
            ],
          }),
        ),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to room and receive sent messages (v2 sends, v3 receives)", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .subscribeToRoomMultipart({
          roomId: bobsRoom.id,
          hooks: {
            onMessage: concatBatch(3, messages => {
              t.equal(messages[0].sender.name, "Alice")
              t.equal(messages[0].room.name, `Bob's new room`)
              t.equal(messages[0].parts.length, 1)
              t.equal(messages[0].parts[0].partType, "inline")
              t.equal(messages[0].parts[0].payload.type, "text/plain")
              t.equal(messages[0].parts[0].payload.content, "yo3")

              t.equal(messages[1].sender.name, "Alice")
              t.equal(messages[1].room.name, `Bob's new room`)
              t.equal(messages[1].parts.length, 2)
              t.equal(messages[1].parts[0].partType, "inline")
              t.equal(messages[1].parts[0].payload.type, "text/plain")
              t.equal(messages[1].parts[0].payload.content, "yoo3")
              t.equal(messages[1].parts[1].partType, "url")
              t.equal(messages[1].parts[1].payload.type, "image/x-pusher-img")
              t.equal(
                messages[1].parts[1].payload.url,
                "https://cataas.com/cat",
              )

              t.equal(messages[2].sender.name, "Alice")
              t.equal(messages[2].room.name, `Bob's new room`)
              t.equal(messages[2].parts.length, 2)
              t.equal(messages[2].parts[0].partType, "inline")
              t.equal(messages[2].parts[0].payload.type, "text/plain")
              t.equal(messages[2].parts[0].payload.content, "yooo3")
              t.equal(messages[2].parts[1].partType, "attachment")
              t.equal(messages[2].parts[1].payload.type, "file/x-pusher-file")
              t.equal(
                messages[2].parts[1].payload.name,
                "file: with spaces.json",
              )
              t.equal(messages[2].parts[1].payload.size, 17)
              t.true(messages[2].parts[1].payload.urlExpiry())
              messages[2].parts[1].payload
                .url()
                .then(url => fetch(url))
                .then(res => res.json())
                .then(data => {
                  t.deepEqual(data, { hello: "world" })
                  alice.disconnect()
                  t.end()
                })
            }),
          },
          messageLimit: 0,
        })
        .then(() => alice.sendMessage({ roomId: bobsRoom.id, text: "yo3" }))
        .then(() =>
          alice.sendMessage({
            roomId: bobsRoom.id,
            text: "yoo3",
            attachment: {
              link: "https://cataas.com/cat",
              type: "image",
            },
          }),
        )
        .then(() =>
          alice.sendMessage({
            roomId: bobsRoom.id,
            text: "yooo3",

            attachment: {
              file: new File(
                [JSON.stringify({ hello: "world" })],
                "file: with spaces.json",
                {
                  type: "application/json",
                },
              ),
              name: "file: with spaces.json",
            },
          }),
        ),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to room and receive sent messages (v3 sends, v3 receives)", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .subscribeToRoomMultipart({
          roomId: bobsRoom.id,
          hooks: {
            onMessage: concatBatch(3, messages => {
              t.equal(messages[0].sender.name, "Alice")
              t.equal(messages[0].room.name, `Bob's new room`)
              t.equal(messages[0].parts.length, 1)
              t.equal(messages[0].parts[0].partType, "inline")
              t.equal(messages[0].parts[0].payload.type, "text/plain")
              t.equal(messages[0].parts[0].payload.content, "yo4")

              t.equal(messages[1].sender.name, "Alice")
              t.equal(messages[1].room.name, `Bob's new room`)
              t.equal(messages[1].parts.length, 2)
              t.equal(messages[1].parts[0].partType, "inline")
              t.equal(messages[1].parts[0].payload.type, "text/plain")
              t.equal(messages[1].parts[0].payload.content, "yoo4")
              t.equal(messages[1].parts[1].partType, "url")
              t.equal(messages[1].parts[1].payload.type, "image/cat")
              t.equal(
                messages[1].parts[1].payload.url,
                "https://cataas.com/cat",
              )

              t.equal(messages[2].sender.name, "Alice")
              t.equal(messages[2].room.name, `Bob's new room`)
              t.equal(messages[2].parts.length, 2)
              t.equal(messages[2].parts[0].partType, "inline")
              t.equal(messages[2].parts[0].payload.type, "text/plain")
              t.equal(messages[2].parts[0].payload.content, "yooo4")
              t.equal(messages[2].parts[1].partType, "attachment")
              t.equal(messages[2].parts[1].payload.type, "application/json")
              t.equal(
                messages[2].parts[1].payload.name,
                "file: with spaces.json",
              )
              t.equal(messages[2].parts[1].payload.size, 17)
              t.true(messages[2].parts[1].payload.urlExpiry())
              messages[2].parts[1].payload
                .url()
                .then(url => fetch(url))
                .then(res => res.json())
                .then(data => {
                  t.deepEqual(data, { hello: "world" })
                  alice.disconnect()
                  t.end()
                })
            }),
          },
          messageLimit: 0,
        })
        .then(() =>
          alice.sendSimpleMessage({ roomId: bobsRoom.id, text: "yo4" }),
        )
        .then(() =>
          alice.sendMultipartMessage({
            roomId: bobsRoom.id,
            parts: [
              { type: "text/plain", content: "yoo4" },
              { type: "image/cat", url: "https://cataas.com/cat" },
            ],
          }),
        )
        .then(() =>
          alice.sendMultipartMessage({
            roomId: bobsRoom.id,
            parts: [
              { type: "text/plain", content: "yooo4" },
              {
                file: new File(
                  [JSON.stringify({ hello: "world" })],
                  "file: with spaces.json",
                  {
                    type: "application/json",
                  },
                ),
              },
            ],
          }),
        ),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("unsubscribe from room", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .subscribeToRoom({
          roomId: bobsRoom.id,
          hooks: {
            onMessage: () => {
              endWithErr(t, "should not be called after unsubscribe")
            },
          },
          messageLimit: 0,
        })
        .then(() => alice.roomSubscriptions[bobsRoom.id].cancel())
        .then(() => alice.sendMessage({ roomId: bobsRoom.id, text: "yoooo" }))
        .then(() =>
          alice.sendSimpleMessage({ roomId: bobsRoom.id, text: "yoooo" }),
        )
        .then(() =>
          setTimeout(() => {
            alice.disconnect()
            t.end()
          }, 1000),
        ),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("unsubscribe from room (v3)", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .subscribeToRoomMultipart({
          roomId: bobsRoom.id,
          hooks: {
            onMessage: () => {
              endWithErr(t, "should not be called after unsubscribe")
            },
          },
          messageLimit: 0,
        })
        .then(() => alice.roomSubscriptions[bobsRoom.id].cancel())
        .then(() => alice.sendMessage({ roomId: bobsRoom.id, text: "yoooo" }))
        .then(() =>
          alice.sendSimpleMessage({ roomId: bobsRoom.id, text: "yoooo" }),
        )
        .then(() =>
          setTimeout(() => {
            alice.disconnect()
            t.end()
          }, 1000),
        ),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

// Attachments

test("send message with malformed attachment fails", t => {
  fetchUser(t, "alice").then(alice =>
    alice
      .sendMessage({
        roomId: bobsRoom.id,
        text: "should fail",
        attachment: { some: "rubbish" },
      })
      .catch(err => {
        t.true(toString(err).match(/attachment/), "attachment error")
        alice.disconnect()
        t.end()
      }),
  )
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`send message with link attachment [sends a message to Bob's room]`, t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .sendMessage({
          roomId: bobsRoom.id,
          text: "see attached link",
          attachment: { link: "https://cataas.com/cat", type: "image" },
        })
        .then(() => {
          alice.disconnect()
          t.end()
        }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("receive message with link attachment", t => {
  fetchUser(t, "alice").then(alice =>
    alice.fetchMessages({ roomId: bobsRoom.id, limit: 1 }).then(([message]) => {
      t.equal(message.text, "see attached link")
      t.deepEqual(message.attachment, {
        link: "https://cataas.com/cat",
        type: "image",
        name: "cat",
      })
      alice.disconnect()
      t.end()
    }),
  )
  t.timeoutAfter(TEST_TIMEOUT)
})

test("receive multipart message with link attachment", t => {
  fetchUser(t, "alice").then(alice =>
    alice
      .fetchMultipartMessages({ roomId: bobsRoom.id, limit: 1 })
      .then(([message]) => {
        t.equal(
          message.parts.find(p => p.partType === "inline").payload.content,
          "see attached link",
        )
        t.equal(
          message.parts.find(p => p.partType === "url").payload.url,
          "https://cataas.com/cat",
        )
        alice.disconnect()
        t.end()
      }),
  )
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`send message with data attachment [sends a message to Bob's room]`, t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .sendMessage({
          roomId: bobsRoom.id,
          text: "see attached json",
          attachment: {
            file: new File(
              [JSON.stringify({ hello: "world" })],
              "file: with spaces.json",
              {
                type: "application/json",
              },
            ),
            name: "file: with spaces.json",
          },
        })
        .then(() => {
          alice.disconnect()
          t.end()
        }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("receive message with data attachment", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .fetchMessages({ roomId: bobsRoom.id, limit: 1 })
        .then(([message]) => {
          t.equal(message.text, "see attached json")
          t.equal(message.attachment.type, "file")
          t.equal(message.attachment.name, "file: with spaces.json")
          return fetch(message.attachment.link)
            .then(res => res.json())
            .then(data => {
              t.deepEqual(data, { hello: "world" })
              alice.disconnect()
              t.end()
            })
        }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("send multipart message with malformed file fails", t => {
  let alice
  fetchUser(t, "alice")
    .then(a => {
      alice = a
      alice.sendMultipartMessage({
        roomId: bobsRoom.id,
        parts: [
          {
            type: "some/rubbish",
            file: {
              name: "some-file.rubbish",
              uri: "file:///some-file.rubbish",
            },
          },
        ],
      })
    })
    .catch(err => {
      t.true(
        toString(err).match(
          /expected part\.file\.size to be of type number but was of type undefined/,
        ),
        "attachment error",
      )
      alice.disconnect()
      t.end()
    }),
    t.timeoutAfter(TEST_TIMEOUT)
})

test(`send message with data attachment (v3) [sends a message to Bob's room]`, t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .sendMultipartMessage({
          roomId: bobsRoom.id,
          parts: [
            {
              type: "text/plain",
              content: "see attached json (v3)",
            },
            {
              file: new File(
                [JSON.stringify({ hello: "world" })],
                "file: with spaces.json",
                { type: "application/json" },
              ),
              customData: { foo: "bar" },
            },
          ],
        })
        .then(() => {
          alice.disconnect()
          t.end()
        }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("receive message with data attachment (v3)", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .fetchMultipartMessages({ roomId: bobsRoom.id, limit: 1 })
        .then(([message]) => {
          t.equal(message.sender.name, "Alice")
          t.equal(message.room.name, `Bob's new room`)
          t.equal(message.parts.length, 2)

          t.equal(message.parts[0].partType, "inline")
          t.equal(message.parts[0].payload.type, "text/plain")
          t.equal(message.parts[0].payload.content, "see attached json (v3)")

          t.equal(message.parts[1].partType, "attachment")
          t.equal(message.parts[1].payload.type, "application/json")
          t.equal(message.parts[1].payload.name, "file: with spaces.json")
          t.equal(message.parts[1].payload.size, 17)
          t.deepEqual(message.parts[1].payload.customData, { foo: "bar" })

          return message.parts[1].payload
            .url()
            .then(url => fetch(url))
            .then(res => res.json())
            .then(data => {
              t.deepEqual(data, { hello: "world" })
              alice.disconnect()
              t.end()
            })
        }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`large inline parts are rejected with an error`, t => {
  let buns = "🐇🐇"
  while (buns.length < 5000) {
    buns = buns + buns
  }
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .sendSimpleMessage({
          roomId: bobsRoom.id,
          text: buns,
        })
        .catch(err => {
          t.true(
            toString(err).match(/message_size_limit_exceeded/),
            "part too large error",
          )
          alice.disconnect()
          t.end()
        }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("[setup] create Carol", t => {
  server
    .createUser({ id: "carol", name: "Carol" })
    .then(() => server.createRoom({ creatorId: "carol", name: `Carol's room` }))
    .then(room => {
      carolsRoom = room // we'll want this in the following tests
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to room implicitly joins", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice
        .subscribeToRoom({ roomId: carolsRoom.id })
        .then(room => {
          t.equal(room.id, carolsRoom.id)
          t.equal(room.name, `Carol's room`)
          t.true(
            any(r => r.id === carolsRoom.id, alice.rooms),
            `Alice's rooms include Carol's room`,
          )
          alice.disconnect()
          t.end()
        })
        .catch(endWithErr(t)),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`user joined hook [Carol joins Bob's room]`, t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice.subscribeToRoom({
        roomId: bobsRoom.id,
        hooks: {
          onUserJoined: user => {
            t.equal(user.id, "carol")
            t.equal(user.name, "Carol")
            alice.disconnect()
            t.end()
          },
        },
      }),
    )
    .then(() =>
      server.apiRequest({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(bobsRoom.id)}/users/add`,
        body: { user_ids: ["carol"] },
        jwt: server.generateAccessToken({ userId: "admin", su: true }).token,
      }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("user came online hook", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice.subscribeToRoom({
        roomId: bobsRoom.id,
        hooks: {
          onPresenceChanged: (state, user) => {
            if (state.previous === "unknown") {
              return // ignore the initial state, we only care about the transition
            }
            t.equal(state.current, "online")
            t.equal(state.previous, "offline")
            t.equal(user.id, "carol")
            t.equal(user.name, "Carol")
            t.equal(user.presence.state, "online")
            alice.disconnect()
            t.end()
          },
        },
      }),
    )
    .then(() =>
      fetchUser(t, "carol").then(c => {
        carol = c
      }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("user went offline hook", t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice.subscribeToRoom({
        roomId: bobsRoom.id,
        hooks: {
          onPresenceChanged: (state, user) => {
            if (state.previous === "unknown") {
              return // ignore the initial state, we only care about the transition
            }
            t.equal(state.current, "offline")
            t.equal(state.previous, "online")
            t.equal(user.id, "carol")
            t.equal(user.name, "Carol")
            t.equal(user.presence.state, "offline")
            alice.disconnect()
            t.end()
          },
        },
      }),
    )
    .then(() => carol.disconnect())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("typing indicators", t => {
  let started
  Promise.all([
    fetchUser(t, "alice").then(alice =>
      alice.subscribeToRoom({
        roomId: bobsRoom.id,
        hooks: {
          onUserStartedTyping: user => {
            started = Date.now()
            t.equal(user.id, "carol")
            t.equal(user.name, "Carol")
          },
          onUserStoppedTyping: user => {
            t.equal(user.id, "carol")
            t.equal(user.name, "Carol")
            t.true(
              Date.now() - started > 1000,
              "fired more than 1s after start",
            )
            alice.disconnect()
            t.end()
          },
        },
      }),
    ),
    fetchUser(t, "carol"),
  ])
    .then(users =>
      users[1]
        .isTypingIn({ roomId: bobsRoom.id })
        .then(() => users[1].disconnect()),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`user left hook [removes Carol from Bob's room]`, t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice.subscribeToRoom({
        roomId: bobsRoom.id,
        hooks: {
          onUserLeft: user => {
            t.equal(user.id, "carol")
            t.equal(user.name, "Carol")
            alice.disconnect()
            t.end()
          },
        },
      }),
    )
    .then(() =>
      server.apiRequest({
        method: "PUT",
        path: `/rooms/${encodeURIComponent(bobsRoom.id)}/users/remove`,
        body: { user_ids: ["carol"] },
        jwt: server.generateAccessToken({ userId: "admin", su: true }).token,
      }),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

// Cursors

test(`new read cursor hook [Bob sets his read cursor in Alice's room]`, t => {
  Promise.all([
    fetchUser(t, "bob").then(bob =>
      bob.joinRoom({ roomId: alicesRoom.id }).then(() => bob),
    ),
    fetchUser(t, "alice").then(alice =>
      alice.subscribeToRoom({
        roomId: alicesRoom.id,
        hooks: {
          onNewReadCursor: cursor => {
            t.equal(cursor.position, 128)
            t.equal(cursor.user.name, "Bob")
            t.equal(cursor.room.name, `Alice's new room`)
            alice.disconnect()
            t.end()
          },
        },
      }),
    ),
  ])
    .then(([bob]) =>
      bob
        .setReadCursor({
          roomId: alicesRoom.id,
          position: 128,
        })
        .then(() => bob.disconnect()),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`get another user's read cursor before subscribing to a room fails`, t => {
  fetchUser(t, "alice")
    .then(alice => {
      t.throws(
        () =>
          alice.readCursor({
            roomId: alicesRoom.id,
            userId: "bob",
          }),
        /subscribe/,
      )
      alice.disconnect()
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`get another user's read cursor after subscribing to a room`, t => {
  fetchUser(t, "alice")
    .then(alice =>
      alice.subscribeToRoom({ roomId: alicesRoom.id }).then(() => alice),
    )
    .then(alice => {
      const cursor = alice.readCursor({
        roomId: alicesRoom.id,
        userId: "bob",
      })
      t.equal(cursor.position, 128)
      t.equal(cursor.user.name, "Bob")
      t.equal(cursor.room.name, `Alice's new room`)
      alice.disconnect()
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("subscribe to same room twice in quick succession, only one hook fired", t => {
  let hookCalled = false

  fetchUser(t, "alice")
    .then(alice =>
      Promise.all(
        [0, 1].map(
          () =>
            alice
              .subscribeToRoom({
                roomId: alicesRoom.id,
                hooks: {
                  onMessage: m => {
                    t.equal(m.text, "arbitrary")

                    if (hookCalled) {
                      endWithErr("onMessage called twice for one message send")
                      return
                    }
                    hookCalled = true

                    setTimeout(() => {
                      alice.disconnect()
                      t.end()
                    }, 500)
                  },
                },
                messageLimit: 0,
              })
              .catch(() => {}), // one of the two subs will error
        ),
      ).then(() =>
        alice.sendSimpleMessage({ roomId: alicesRoom.id, text: "arbitrary" }),
      ),
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test("non-admin update room fails gracefully", t => {
  fetchUser(t, "alice").then(alice =>
    alice
      .updateRoom({
        roomId: bobsRoom.id,
        name: `Bob's updated room`,
      })
      .then(() => t.end(`updateRoom should not resolve`))
      .catch(err => {
        t.true(toString(err).match(/permission/), "permission error")
        alice.disconnect()
        t.end()
      }),
  )
  t.timeoutAfter(TEST_TIMEOUT)
})

test("non-admin delete room fails gracefully", t => {
  fetchUser(t, "alice").then(alice =>
    alice
      .deleteRoom({ roomId: bobsRoom.id })
      .then(() => t.end(`deleteRoom should not resolve`))
      .catch(err => {
        t.true(toString(err).match(/permission/), "permission error")
        alice.disconnect()
        t.end()
      }),
  )
  t.timeoutAfter(TEST_TIMEOUT)
})

test("[setup] promote Alice to admin", t => {
  server
    .assignGlobalRoleToUser({ userId: "alice", name: "admin" })
    .then(() => t.end())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`update room name [renames Bob's room]`, t => {
  let alice
  fetchUser(t, "alice", {
    onRoomUpdated: room => {
      t.equal(room.id, bobsRoom.id)
      t.equal(room.isPrivate, false)
      t.equal(room.name, `Bob's updated room`)
      t.equal(room.customData, undefined)
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
      alice.updateRoom({
        roomId: bobsRoom.id,
        name: `Bob's updated room`,
      })
    })
    .then(res => t.equal(res, undefined))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`update room privacy [makes Bob's room private]`, t => {
  let alice
  fetchUser(t, "alice", {
    onRoomUpdated: room => {
      t.equal(room.id, bobsRoom.id)
      t.equal(room.isPrivate, true)
      t.equal(room.name, `Bob's updated room`)
      t.equal(room.customData, undefined)
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
      alice.updateRoom({
        roomId: bobsRoom.id,
        private: true,
      })
    })
    .then(res => t.equal(res, undefined))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`update room custom data [changes Bob's room's custom data]`, t => {
  let alice
  fetchUser(t, "alice", {
    onRoomUpdated: room => {
      t.equal(room.id, bobsRoom.id)
      t.equal(room.isPrivate, true)
      t.equal(room.name, `Bob's updated room`)
      t.deepEqual(room.customData, { foo: "bar", n: 42 })
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
      alice.updateRoom({
        roomId: bobsRoom.id,
        customData: { foo: "bar", n: 42 },
      })
    })
    .then(res => t.equal(res, undefined))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`delete room [deletes Bob's room]`, t => {
  let alice
  fetchUser(t, "alice", {
    onRoomDeleted: room => {
      t.equal(room.id, bobsRoom.id)
      t.false(
        any(r => r.id === bobsRoom.id, alice.rooms),
        `alice.rooms doesn't contain Bob's room`,
      )
      alice.disconnect()
      t.end()
    },
  })
    .then(a => {
      alice = a
      alice.deleteRoom({ roomId: bobsRoom.id })
    })
    .then(res => t.equal(res, undefined))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

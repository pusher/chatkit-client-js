import test from 'tape-catch'
import {
  any,
  compose,
  concat,
  curry,
  find,
  head,
  length,
  map,
  prop,
  once,
  reduce,
  tail,
  toString
} from 'ramda'

import ChatkitServer from 'pusher-chatkit-server'
import { TokenProvider, ChatManager } from '../dist/web/chatkit.js'
import { INSTANCE_LOCATOR, INSTANCE_KEY, TOKEN_PROVIDER_URL } from './config'

// Skipped tests don't currently pass, but should! The tests interact with a
// real instance, and rely on the state of that instance. If the instance gets
// in to an invalid state, you can usually get away with just running the tests
// a couple of times to give the teardown tests a chance to run.
//
// Some tests demonstrate behaviour that is not quite what I think it should
// be, but is close enough to be useful. Specific discrepencies in this case
// are marked with FIXMEs.

let alicesRoom, bobsRoom, alicesPrivateRoom

const TEST_TIMEOUT = 15 * 1000

const server = new ChatkitServer({
  instanceLocator: INSTANCE_LOCATOR,
  key: INSTANCE_KEY
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

const concatBatch = (n, f) => batch(n, compose(f, reduce(concat, [])))

const fetchUser = (t, userId, hooks = {}) => new ChatManager({
  instanceLocator: INSTANCE_LOCATOR,
  userId,
  tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL }),
  logger: {
    error: console.log,
    warn: console.log,
    info: () => {},
    debug: () => {},
    verbose: () => {}
  }
}).connect(map(once, hooks)).catch(endWithErr(t))

const endWithErr = curry((t, err) => t.end(`error: ${toString(err)}`))

const sendMessages = (user, room, texts) => length(texts) === 0
  ? Promise.resolve()
  : user.sendMessage({ roomId: room.id, text: head(texts) })
    .then(() => sendMessages(user, room, tail(texts)))

// Imports

test('can import TokenProvider', t => {
  t.equal(typeof TokenProvider, 'function')
  t.end()
})

test('can import ChatManager', t => {
  t.equal(typeof ChatManager, 'function')
  t.end()
})

// Token provider

test('instantiate TokenProvider with url', t => {
  const tokenProvider = new TokenProvider({ url: TOKEN_PROVIDER_URL })
  t.equal(typeof tokenProvider, 'object')
  t.equal(typeof tokenProvider.fetchToken, 'function')
  t.end()
})

test('instantiate TokenProvider with non-string url fails', t => {
  t.throws(() => new TokenProvider({ url: 42 }), /url/)
  t.end()
})

// Chat manager

test('instantiate ChatManager with correct params', t => {
  const chatManager = new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId: 'alice',
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL })
  })
  t.equal(typeof chatManager, 'object')
  t.equal(typeof chatManager.connect, 'function')
  t.end()
})

test('instantiate ChatManager with non-string instanceLocator fails', t => {
  t.throws(() => new ChatManager({
    instanceLocator: 42,
    userId: 'alice',
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL })
  }), /instanceLocator/)
  t.end()
})

test('instantiate ChatManager without userId fails', t => {
  t.throws(() => new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId: 42,
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL })
  }), /userId/)
  t.end()
})

test('instantiate ChatManager with non-string userId fails', t => {
  t.throws(() => new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId: 42,
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL })
  }), /string/)
  t.end()
})

test('instantiate ChatManager with non tokenProvider fails', t => {
  t.throws(() => new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId: 42,
    tokenProvider: { foo: 'bar' }
  }), /tokenProvider/)
  t.end()
})

test('connection fails if provided with non-function hooks', t => {
  const chatManager = new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId: 'alice',
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL })
  })
  t.throws(
    () => chatManager.connect({ nonFunction: 42 }),
    /nonFunction/
  )
  t.end()
})

test('connection fails for nonexistent user', t => {
  const chatManager = new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    userId: 'alice',
    tokenProvider: new TokenProvider({ url: TOKEN_PROVIDER_URL })
  })
  chatManager.connect()
    .then(() => {
      t.end('promise should not resolve')
    })
    .catch(err => {
      t.true(
        toString(err).match(/user does not exist/),
        'user does not exist error'
      )
      t.end()
    })
  t.timeoutAfter(TEST_TIMEOUT)
})

test('[setup] create Alice', t => {
  server.createUser('alice', 'Alice')
    .then(() => server.createRoom('alice', { name: `Alice's room` }))
    .then(room => {
      alicesRoom = room // we'll want this in the following tests
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('connection resolves with current user object', t => {
  fetchUser(t, 'alice').then(alice => {
    t.equal(typeof alice, 'object')
    t.equal(alice.id, 'alice')
    t.equal(alice.name, 'Alice')
    t.true(Array.isArray(alice.rooms), 'alice.rooms is an array')
    t.equal(length(alice.rooms), 1)
    t.equal(alice.rooms[0].name, `Alice's room`)
    t.equal(alice.rooms[0].isPrivate, false)
    t.equal(alice.rooms[0].createdByUserId, 'alice')
    t.deepEqual(alice.rooms[0].userIds, ['alice'])
    t.true(Array.isArray(alice.rooms[0].users), 'users is an array')
    t.equal(length(alice.rooms[0].users), 1)
    t.equal(alice.rooms[0].users[0].name, 'Alice')
    t.end()
  })
  t.timeoutAfter(TEST_TIMEOUT)
})

// User subscription

test(`added to room hook [creates Bob & Bob's room]`, t => {
  let alice
  fetchUser(t, 'alice', {
    addedToRoom: room => {
      t.equal(room.name, `Bob's room`)
      t.true(
        any(r => r.id === room.id, alice.rooms),
        `should contain Bob's room`
      )
      const br = find(r => r.id === room.id, alice.rooms)
      t.true(br, `alice.rooms should contain Bob's room`)
      t.deepEqual(map(prop('name'), br.users).sort(), ['Alice', 'Bob'])
      t.end()
    }
  })
    .then(a => { alice = a })
    .then(() => server.createUser('bob', 'Bob'))
    .then(() => server.createRoom('bob', {
      name: `Bob's room`,
      userIds: ['alice']
    }))
    .then(room => {
      bobsRoom = room // we'll want this in the following tests
    })
  t.timeoutAfter(TEST_TIMEOUT)
})

// This test has to run before any tests which cause Bob to open a subscription
// (since then he will already be online)
test('user came online hook (user sub)', t => {
  fetchUser(t, 'alice', {
    userCameOnline: user => {
      t.equal(user.id, 'bob')
      t.equal(user.presence.state, 'online')
      t.end()
    }
  }).then(() => fetchUser(t, 'bob'))
  t.timeoutAfter(TEST_TIMEOUT)
})

// We can't easily test for the user going offline, because the presence
// subscription in the above test hangs around until it is garbage collected.
// TODO cancel methods so that we can do this, and because we should have them
// anyway

test('typing indicators (user sub)', t => {
  let started
  Promise.all([
    fetchUser(t, 'alice', {
      userStartedTyping: (room, user) => {
        started = Date.now()
        t.equal(room.id, bobsRoom.id)
        t.equal(user.id, 'bob')
      },
      userStoppedTyping: (room, user) => {
        t.equal(room.id, bobsRoom.id)
        t.equal(user.id, 'bob')
        t.true(Date.now() - started > 1000, 'fired more than 1s after start')
        t.end()
      }
    }),
    fetchUser(t, 'bob')
  ])
    .then(([alice, bob]) => bob.isTypingIn(bobsRoom.id))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user left room hook (user sub) [removes Bob from his own room]', t => {
  fetchUser(t, 'alice', {
    userLeftRoom: (room, user) => {
      t.equal(room.id, bobsRoom.id)
      t.equal(user.id, 'bob')
      t.end()
    }
  }).then(() => server.apiRequest({
    method: 'PUT',
    path: `/rooms/${bobsRoom.id}/users/remove`,
    body: { user_ids: ['bob'] },
    jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
  }))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user joined room hook (user sub) [Bob rejoins his own room]', t => {
  fetchUser(t, 'alice', {
    userJoinedRoom: (room, user) => {
      t.equal(room.id, bobsRoom.id)
      t.equal(user.id, 'bob')
      t.end()
    }
  }).then(() => server.apiRequest({
    method: 'PUT',
    path: `/rooms/${bobsRoom.id}/users/add`,
    body: { user_ids: ['bob'] },
    jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
  }))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('room updated hook', t => {
  fetchUser(t, 'alice', {
    roomUpdated: room => {
      t.equal(room.id, bobsRoom.id)
      t.equal(room.name, `Bob's renamed room`)
      t.end()
    }
  }).then(() => server.apiRequest({
    method: 'PUT',
    path: `/rooms/${bobsRoom.id}`,
    body: { name: `Bob's renamed room` },
    jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
  }))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`removed from room hook [removes Alice from Bob's room]`, t => {
  fetchUser(t, 'alice', {
    removedFromRoom: room => {
      t.equal(room.id, bobsRoom.id)
      t.end()
    }
  }).then(() => server.apiRequest({
    method: 'PUT',
    path: `/rooms/${bobsRoom.id}/users/remove`,
    body: { user_ids: ['alice'] },
    jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
  }))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`room deleted hook [destroys Alice's room]`, t => {
  fetchUser(t, 'alice', {
    roomDeleted: room => {
      t.equal(room.id, alicesRoom.id)
      t.end()
    }
  }).then(() => server.apiRequest({
    method: 'DELETE',
    path: `/rooms/${alicesRoom.id}`,
    jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
  }))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`create room [creates Alice's new room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.createRoom({ name: `Alice's new room` }))
    .then(room => {
      alicesRoom = room
      t.equal(room.name, `Alice's new room`)
      t.false(room.isPrivate, `room shouldn't be private`)
      t.equal(room.createdByUserId, 'alice')
      t.deepEqual(room.userIds, ['alice'])
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`create private room [creates Alice's private room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.createRoom({
      name: `Alice's private room`,
      private: true
    }))
    .then(room => {
      alicesPrivateRoom = room
      t.equal(room.name, `Alice's private room`)
      t.true(room.isPrivate, 'room should be private')
      t.equal(room.createdByUserId, 'alice')
      t.deepEqual(room.userIds, ['alice'])
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`create room with members [creates Bob's new room]`, t => {
  fetchUser(t, 'bob')
    .then(bob => bob.createRoom({
      name: `Bob's new room`,
      addUserIds: ['alice']
    }))
    .then(room => {
      bobsRoom = room
      t.equal(room.name, `Bob's new room`)
      t.false(room.isPrivate, `room shouldn't be private`)
      t.equal(room.createdByUserId, 'bob')
      t.deepEqual(room.userIds.sort(), ['alice', 'bob'])
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('get joined rooms', t => {
  const expectedRoomIds = [alicesRoom, bobsRoom, alicesPrivateRoom]
    .map(r => r.id).sort()
  fetchUser(t, 'alice')
    .then(alice => {
      t.deepEqual(map(r => r.id, alice.rooms).sort(), expectedRoomIds)
      t.end()
    })
  t.timeoutAfter(TEST_TIMEOUT)
})

test('get joinable rooms', t => {
  fetchUser(t, 'bob')
    .then(bob => bob.getJoinableRooms())
    .then(rooms => {
      const ids = rooms.map(r => r.id)
      t.true(ids.includes(alicesRoom.id), `should include Alice's room`)
      t.false(ids.includes(bobsRoom.id), `shouldn't include Bob's room`)
      t.false(
        ids.includes(alicesPrivateRoom.id),
        `shouldn't include Alice's private room`
      )
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('get all rooms', t => {
  fetchUser(t, 'bob')
    .then(bob => bob.getAllRooms())
    .then(rooms => {
      const ids = rooms.map(r => r.id)
      t.true(ids.includes(alicesRoom.id), `should include Alice's room`)
      t.true(ids.includes(bobsRoom.id), `should include Bob's room`)
      t.false(
        ids.includes(alicesPrivateRoom.id),
        `shouldn't include Alice's private room`
      )
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`join room [Bob joins Alice's room]`, t => {
  fetchUser(t, 'bob')
    .then(bob => bob.joinRoom(alicesRoom.id)
      .then(room => {
        t.equal(room.id, alicesRoom.id)
        t.equal(room.createdByUserId, 'alice')
        t.true(room.userIds.includes('bob'), 'should include bob')
        t.true(
          any(r => r.id === alicesRoom.id, bob.rooms),
          `should include Alice's room`
        )
        t.end()
      })
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`leave room [Bob leaves Alice's room]`, t => {
  fetchUser(t, 'bob')
    .then(bob => {
      t.true(
        any(r => r.id === alicesRoom.id, bob.rooms),
        `should include Bob's room`
      )
      bob.leaveRoom(alicesRoom.id)
        .then(() => {
          t.false(
            any(r => r.id === alicesRoom.id, bob.rooms),
            `shouldn't include Alice's room`
          )
          t.end()
        })
    })
  t.timeoutAfter(TEST_TIMEOUT)
})

test('add user [Alice adds Bob to her room]', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.addUser('bob', alicesRoom.id)
      .then(() => {
        const room = find(r => r.id === alicesRoom.id, alice.rooms)
        t.deepEqual(room.userIds.sort(), ['alice', 'bob'])
        t.end()
      })
      .catch(endWithErr(t))
    )
  t.timeoutAfter(TEST_TIMEOUT)
})

test('remove user [Alice removes Bob from her room]', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.removeUser('bob', alicesRoom.id)
      .then(() => {
        const room = find(r => r.id === alicesRoom.id, alice.rooms)
        t.deepEqual(room.userIds.sort(), ['alice'])
        t.end()
      })
      .catch(endWithErr(t))
    )
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`send message [sends four messages to Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => sendMessages(alice, bobsRoom, [
      'hello', 'hey', 'hi', 'ho'
    ]))
    .then(t.end)
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('fetch messages', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.fetchMessages(bobsRoom.id))
    .then(messages => {
      t.deepEqual(messages.map(m => m.text), ['hello', 'hey', 'hi', 'ho'])
      t.equal(messages[0].sender.id, 'alice')
      t.equal(messages[0].sender.name, 'Alice')
      t.equal(messages[0].room.id, bobsRoom.id)
      t.equal(messages[0].room.name, bobsRoom.name)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test.skip('fetch messages with pagination', t => {
  fetchUser(t, 'alice')
    .then(alice => new Promise(resolve => {
      alice.fetchMessagesFromRoom(
        bobsRoom,
        { limit: 2 },
        messages => {
          t.deepEqual(messages.map(m => m.text), ['hi', 'ho'])
          resolve([alice, messages[0].id])
        },
        endWithErr(t)
      )
    }))
    .then(([alice, initialId]) => {
      alice.fetchMessagesFromRoom(
        bobsRoom,
        { initialId },
        messages => {
          t.deepEqual(messages.map(m => m.text), ['hello', 'hey'])
          t.end()
        },
        endWithErr(t)
      )
    })
  t.timeoutAfter(TEST_TIMEOUT)
})

test.skip('subscribe to room and fetch initial messages', t => {
  fetchUser(t, 'alice').then(alice => alice.subscribeToRoom(
    find(r => r.id === bobsRoom.id, alice.rooms),
    {
      newMessage: concatBatch(4, messages => {
        t.deepEqual(map(m => m.text, messages), ['hello', 'hey', 'hi', 'ho'])
        t.end()
      })
    }
  ))
  t.timeoutAfter(TEST_TIMEOUT)
})

test.skip('subscribe to room and fetch last two message only', t => {
  fetchUser(t, 'alice').then(alice => alice.subscribeToRoom(
    find(r => r.id === bobsRoom.id, alice.rooms),
    {
      newMessage: concatBatch(2, messages => {
        t.deepEqual(map(m => m.text, messages), ['hi', 'ho'])
        t.end()
      })
    },
    2
  ))
  t.timeoutAfter(TEST_TIMEOUT)
})

test.skip('subscribe to room and receive sent messages', t => {
  fetchUser(t, 'alice').then(alice => {
    alice.subscribeToRoom(
      find(r => r.id === bobsRoom.id, alice.rooms),
      {
        newMessage: concatBatch(3, messages => {
          t.deepEqual(map(m => m.text, messages), ['yo', 'yoo', 'yooo'])
          t.end()
        })
      },
      0
    )
    setTimeout(() => sendMessages(alice, bobsRoom, ['yo', 'yoo', 'yooo']), 1000)
  })
  t.timeoutAfter(TEST_TIMEOUT)
})

test.skip('[setup] create Carol', t => server.createUser('carol', 'Carol')
  .then(() => t.end())
  .catch(endWithErr(t))
)

test.skip(`user joined hook [Carol joins Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => {
      alice.subscribeToRoom(find(r => r.id === bobsRoom.id, alice.rooms), {
        userJoined: once(user => {
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
          t.end()
        })
      })
    })
    .then(() => server.apiRequest({
      method: 'PUT',
      path: `/rooms/${bobsRoom.id}/users/add`,
      body: { user_ids: ['carol'] },
      jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
    }))
  t.timeoutAfter(TEST_TIMEOUT)
})

// This test has to run before any tests which cause Carol to open a
// subscription (since then she will already be online)
test.skip('user came online hook', t => {
  fetchUser(t, 'alice')
    .then(alice => {
      alice.subscribeToRoom(find(r => r.id === bobsRoom.id, alice.rooms), {
        // FIXME inconsistent naming
        userCameOnlineInRoom: once(user => {
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
          t.end()
        })
      })
    })
    // FIXME We have to wrap this in a timeout to give the presence
    // subscription a chance to finish. Not ideal.
    .then(() => setTimeout(() => fetchUser(t, 'carol'), 1000))
  t.timeoutAfter(TEST_TIMEOUT)
})

// We can't easily test for the user going offline, because the presence
// subscription in the above test hangs around until it is garbage collected.

test.skip('typing indicators', t => {
  let started
  Promise.all([
    fetchUser(t, 'alice').then(alice => {
      alice.subscribeToRoom(find(r => r.id === bobsRoom.id, alice.rooms), {
        userStartedTyping: once(user => {
          started = Date.now()
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
        }),
        userStoppedTyping: once(user => {
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
          t.true(Date.now() - started > 1000, 'fired more than 1s after start')
          t.end()
        })
      })
      return alice
    }),
    fetchUser(t, 'carol')
  ]).then(([alice, carol]) => carol.isTypingIn(
    bobsRoom.id,
    () => {},
    err => t.end(err)
  ))
  t.timeoutAfter(TEST_TIMEOUT)
})

test.skip(`user left hook [removes Carol from Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => {
      alice.subscribeToRoom(find(r => r.id === bobsRoom.id, alice.rooms), {
        userLeft: once(user => {
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
          t.end()
        })
      })
    })
    .then(() => server.apiRequest({
      method: 'PUT',
      path: `/rooms/${bobsRoom.id}/users/remove`,
      body: { user_ids: ['carol'] },
      jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
    }))
  t.timeoutAfter(TEST_TIMEOUT)
})

// FIXME
test.skip('non-admin update room fails gracefully', t => {
  fetchUser(t, 'alice').then(alice => alice.updateRoom(
    alicesRoom.id,
    { name: `Alice's updated room` },
    () => t.end(`onSuccess shouldn't be called`),
    err => {
      t.true(toString(err).match(/permission/), 'permission error')
      t.end()
    }
  ))
  t.timeoutAfter(TEST_TIMEOUT)
})

// FIXME
test.skip('non-admin delete room fails gracefully', t => {
  fetchUser(t, 'alice').then(alice => alice.updateRoom(
    alicesRoom.id,
    { name: `Alice's updated room` },
    () => t.end(`onSuccess shouldn't be called`),
    err => {
      t.true(toString(err).match(/permission/), 'permission error')
      t.end()
    }
  ))
  t.timeoutAfter(TEST_TIMEOUT)
})

// TODO promote Alice to admin and update and delete rooms successfully

// TODO files stuff

// TODO read cursors (perhaps reconsider interface)

test.skip('[teardown] destroy Carol', t => {
  server.deleteUser('carol').then(() => t.end()).catch(err => t.end(err))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('[teardown] destroy Bob', t => {
  server.deleteUser('bob').then(() => t.end()).catch(err => t.end(err))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('[teardown] destroy Alice', t => {
  server.deleteUser('alice').then(() => t.end()).catch(err => t.end(err))
  t.timeoutAfter(TEST_TIMEOUT)
})

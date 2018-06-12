/* eslint-env browser */

import test from 'tape'
import {
  any,
  compose,
  concat,
  contains,
  curry,
  find,
  head,
  length,
  map,
  prop,
  reduce,
  tail,
  toString
} from 'ramda'

import ChatkitServer from '@pusher/chatkit-server'
/* eslint-disable import/no-duplicates */
import { TokenProvider, ChatManager } from '../dist/web/chatkit.js'
import Chatkit from '../dist/web/chatkit.js'
/* eslint-enable import/no-duplicates */
import {
  INSTANCE_LOCATOR,
  INSTANCE_KEY,
  TOKEN_PROVIDER_URL
} from './config/production'

let alicesRoom, bobsRoom, carolsRoom, alicesPrivateRoom
let dataAttachmentUrl, bob, carol

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
}).connect(hooks).catch(endWithErr(t))

const endWithErr = curry((t, err) => t.end(`error: ${toString(err)}`))

const sendMessages = (user, room, texts) => length(texts) === 0
  ? Promise.resolve()
  : user.sendMessage({ roomId: room.id, text: head(texts) })
    .then(() => sendMessages(user, room, tail(texts)))

// Teardown first so that we can kill the tests at any time, safe in the
// knowledge that we'll always be starting with a blank slate next time

const teardown = currentUser => currentUser.disconnect()

test('[teardown]', t => {
  server.apiRequest({
    method: 'DELETE',
    path: '/resources',
    jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
  })
    .then(() => t.end())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT * 10)
})

test('[setup] create permissions', t => {
  Promise.all([
    server.createGlobalRole({
      name: 'default',
      permissions: [
        'message:create',
        'room:join',
        'room:leave',
        'room:members:add',
        'room:members:remove',
        'room:get',
        'room:create',
        'room:messages:get',
        'room:typing_indicator:create',
        'presence:subscribe',
        'user:get',
        'user:rooms:get',
        'file:get',
        'file:create',
        'cursors:read:get',
        'cursors:read:set'
      ]
    }),
    server.createGlobalRole({
      name: 'admin',
      permissions: [
        'message:create',
        'room:join',
        'room:leave',
        'room:members:add',
        'room:members:remove',
        'room:get',
        'room:create',
        'room:messages:get',
        'room:typing_indicator:create',
        'presence:subscribe',
        'user:get',
        'user:rooms:get',
        'file:get',
        'file:create',
        'cursors:read:get',
        'cursors:read:set',
        'room:delete',
        'room:update'
      ]
    })
  ])
    .then(() => t.end())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT * 10)
})

// Imports

test('can import TokenProvider', t => {
  t.equal(typeof TokenProvider, 'function')
  t.end()
})

test('can import ChatManager', t => {
  t.equal(typeof ChatManager, 'function')
  t.end()
})

test('can import default', t => {
  t.equal(typeof Chatkit, 'object')
  t.equal(typeof Chatkit.TokenProvider, 'function')
  t.equal(typeof Chatkit.ChatManager, 'function')
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
  server.createUser({ id: 'alice', name: 'Alice' })
    .then(() => server.createRoom({ creatorId: 'alice', name: `Alice's room` }))
    .then(room => {
      alicesRoom = room // we'll want this in the following tests
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('connection resolves with current user object', t => {
  fetchUser(t, 'alice')
    .then(alice => {
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
      teardown(alice)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

// User subscription

test('own read cursor undefined if not set', t => {
  fetchUser(t, 'alice')
    .then(alice => {
      t.equal(alice.readCursor({ roomId: alicesRoom.id }), undefined)
      teardown(alice)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('new read cursor hook [Alice sets her read cursor in her room]', t => {
  let mobileAlice, browserAlice
  Promise.all([fetchUser(t, 'alice'), fetchUser(t, 'alice', {
    onNewReadCursor: cursor => {
      t.equal(cursor.position, 42)
      t.equal(cursor.user.name, 'Alice')
      t.equal(cursor.room.name, `Alice's room`)
      teardown(mobileAlice)
      teardown(browserAlice)
      t.end()
    }
  })])
    .then(([m, b]) => {
      mobileAlice = m
      browserAlice = b
      mobileAlice.setReadCursor({ roomId: alicesRoom.id, position: 42 })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('get own read cursor', t => {
  fetchUser(t, 'alice')
    .then(alice => {
      const cursor = alice.readCursor({ roomId: alicesRoom.id })
      t.equal(cursor.position, 42)
      t.equal(cursor.user.name, 'Alice')
      t.equal(cursor.room.name, `Alice's room`)
      teardown(alice)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`added to room hook [creates Bob & Bob's room]`, t => {
  let alice
  fetchUser(t, 'alice', {
    onAddedToRoom: room => {
      t.equal(room.name, `Bob's room`)
      t.true(
        any(r => r.id === room.id, alice.rooms),
        `should contain Bob's room`
      )
      const br = find(r => r.id === room.id, alice.rooms)
      t.true(br, `alice.rooms should contain Bob's room`)
      t.deepEqual(map(prop('name'), br.users).sort(), ['Alice', 'Bob'])
      teardown(alice)
      t.end()
    }
  })
    .then(a => { alice = a })
    .then(() => server.createUser({ id: 'bob', name: 'Bob' }))
    .then(() => server.createRoom({
      creatorId: 'bob',
      name: `Bob's room`,
      userIds: ['alice']
    }))
    .then(room => {
      bobsRoom = room // we'll want this in the following tests
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user came online hook (user sub)', t => {
  let alice
  fetchUser(t, 'alice', {
    onUserCameOnline: user => {
      t.equal(user.id, 'bob')
      t.equal(user.presence.state, 'online')
      teardown(alice)
      t.end()
    }
  })
    .then(a => {
      alice = a
      fetchUser(t, 'bob').then(b => { bob = b })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user went offline hook (user sub)', t => {
  let alice
  fetchUser(t, 'alice', {
    onUserWentOffline: user => {
      t.equal(user.id, 'bob')
      t.equal(user.presence.state, 'offline')
      teardown(alice)
      t.end()
    }
  })
    .then(a => {
      alice = a
      teardown(bob)
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('typing indicators (user sub)', t => {
  let started, alice
  Promise.all([
    fetchUser(t, 'alice', {
      onUserStartedTyping: (room, user) => {
        started = Date.now()
        t.equal(room.id, bobsRoom.id)
        t.equal(user.id, 'bob')
      },
      onUserStoppedTyping: (room, user) => {
        t.equal(room.id, bobsRoom.id)
        t.equal(user.id, 'bob')
        t.true(Date.now() - started > 1000, 'fired more than 1s after start')
        teardown(alice)
        t.end()
      }
    }),
    fetchUser(t, 'bob')
  ])
    .then(([a, bob]) => {
      alice = a
      bob.isTypingIn({ roomId: bobsRoom.id })
      teardown(bob)
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user left room hook (user sub) [removes Bob from his own room]', t => {
  let alice
  fetchUser(t, 'alice', {
    onUserLeftRoom: (room, user) => {
      t.equal(room.id, bobsRoom.id)
      t.equal(user.id, 'bob')
      teardown(alice)
      t.end()
    }
  })
    .then(a => {
      alice = a
      server.apiRequest({
        method: 'PUT',
        path: `/rooms/${bobsRoom.id}/users/remove`,
        body: { user_ids: ['bob'] },
        jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user joined room hook (user sub) [Bob rejoins his own room]', t => {
  let alice
  fetchUser(t, 'alice', {
    onUserJoinedRoom: (room, user) => {
      t.equal(user.id, 'bob')
      t.equal(room, bobsRoom)
      t.true(contains('bob', bobsRoom.userIds), `bob's room updated`)
      teardown(alice)
      t.end()
    }
  })
    .then(a => {
      alice = a
      bobsRoom = find(r => r.id === bobsRoom.id, alice.rooms)
      server.apiRequest({
        method: 'PUT',
        path: `/rooms/${bobsRoom.id}/users/add`,
        body: { user_ids: ['bob'] },
        jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('room updated hook', t => {
  let alice
  fetchUser(t, 'alice', {
    onRoomUpdated: room => {
      t.equal(room.id, bobsRoom.id)
      t.equal(room.name, `Bob's renamed room`)
      teardown(alice)
      t.end()
    }
  })
    .then(a => {
      alice = a
      server.apiRequest({
        method: 'PUT',
        path: `/rooms/${bobsRoom.id}`,
        body: { name: `Bob's renamed room` },
        jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`removed from room hook [removes Alice from Bob's room]`, t => {
  let alice
  fetchUser(t, 'alice', {
    onRemovedFromRoom: room => {
      t.equal(room.id, bobsRoom.id)
      teardown(alice)
      t.end()
    }
  })
    .then(a => {
      alice = a
      server.apiRequest({
        method: 'PUT',
        path: `/rooms/${bobsRoom.id}/users/remove`,
        body: { user_ids: ['alice'] },
        jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`room deleted hook [destroys Alice's room]`, t => {
  let alice
  fetchUser(t, 'alice', {
    onRoomDeleted: room => {
      t.equal(room.id, alicesRoom.id)
      teardown(alice)
      t.end()
    }
  })
    .then(a => {
      alice = a
      server.apiRequest({
        method: 'DELETE',
        path: `/rooms/${alicesRoom.id}`,
        jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
      })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`create room [creates Alice's new room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => {
      const result = alice.createRoom({ name: `Alice's new room` })
      teardown(alice)
      return result
    })
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
    .then(alice => {
      const result = alice.createRoom({
        name: `Alice's private room`,
        private: true
      })
      teardown(alice)
      return result
    })
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
    .then(bob => {
      const result = bob.createRoom({
        name: `Bob's new room`,
        addUserIds: ['alice']
      })
      teardown(bob)
      return result
    })
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
      teardown(alice)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('get joinable rooms', t => {
  fetchUser(t, 'bob')
    .then(bob => {
      const result = bob.getJoinableRooms()
      teardown(bob)
      return result
    })
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

test(`join room [Bob joins Alice's room]`, t => {
  fetchUser(t, 'bob')
    .then(bob => bob.joinRoom({ roomId: alicesRoom.id })
      .then(room => {
        t.equal(room.id, alicesRoom.id)
        t.equal(room.createdByUserId, 'alice')
        t.true(room.userIds.includes('bob'), 'should include bob')
        t.true(
          any(r => r.id === alicesRoom.id, bob.rooms),
          `should include Alice's room`
        )
        teardown(bob)
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
      bob.leaveRoom({ roomId: alicesRoom.id })
        .then(() => {
          t.false(
            any(r => r.id === alicesRoom.id, bob.rooms),
            `shouldn't include Alice's room`
          )
          teardown(bob)
          t.end()
        })
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('add user [Alice adds Bob to her room]', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.addUserToRoom({
      userId: 'bob',
      roomId: alicesRoom.id
    })
      .then(() => {
        const room = find(r => r.id === alicesRoom.id, alice.rooms)
        t.deepEqual(room.userIds.sort(), ['alice', 'bob'])
        teardown(alice)
        t.end()
      })
      .catch(endWithErr(t))
    )
  t.timeoutAfter(TEST_TIMEOUT)
})

test('remove user [Alice removes Bob from her room]', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.removeUserFromRoom({
      userId: 'bob',
      roomId: alicesRoom.id
    })
      .then(() => {
        const room = find(r => r.id === alicesRoom.id, alice.rooms)
        t.deepEqual(room.userIds.sort(), ['alice'])
        teardown(alice)
        t.end()
      })
      .catch(endWithErr(t))
    )
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`send messages [sends four messages to Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => sendMessages(alice, bobsRoom, [
      'hello', 'hey', 'hi', 'ho'
    ]).then(() => teardown(alice)))
    .then(t.end)
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('fetch messages', t => {
  let alice
  fetchUser(t, 'alice')
    .then(a => {
      alice = a
      return alice.fetchMessages({ roomId: bobsRoom.id })
    })
    .then(messages => {
      t.deepEqual(messages.map(m => m.text), ['hello', 'hey', 'hi', 'ho'])
      t.equal(messages[0].sender.id, 'alice')
      t.equal(messages[0].sender.name, 'Alice')
      t.equal(messages[0].room.id, bobsRoom.id)
      t.equal(messages[0].room.name, bobsRoom.name)
      teardown(alice)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('fetch messages with pagination', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.fetchMessages({ roomId: bobsRoom.id, limit: 2 })
      .then(messages => {
        t.deepEqual(messages.map(m => m.text), ['hi', 'ho'])
        return messages[0].id
      })
      .then(initialId => alice.fetchMessages({
        roomId: bobsRoom.id,
        initialId
      }))
      .then(messages => {
        t.deepEqual(messages.map(m => m.text), ['hello', 'hey'])
        teardown(alice)
        t.end()
      })
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('subscribe to room and fetch initial messages', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: bobsRoom.id,
      hooks: {
        onNewMessage: concatBatch(4, messages => {
          t.deepEqual(map(m => m.text, messages), ['hello', 'hey', 'hi', 'ho'])
          t.equal(messages[0].sender.name, 'Alice')
          t.equal(messages[0].room.name, `Bob's new room`)
          teardown(alice)
          t.end()
        })
      }
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('subscribe to room and fetch last two message only', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: bobsRoom.id,
      hooks: {
        onNewMessage: concatBatch(2, messages => {
          t.deepEqual(map(m => m.text, messages), ['hi', 'ho'])
          teardown(alice)
          t.end()
        })
      },
      messageLimit: 2
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('subscribe to room and receive sent messages', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: bobsRoom.id,
      hooks: {
        onNewMessage: concatBatch(3, messages => {
          t.deepEqual(map(m => m.text, messages), ['yo', 'yoo', 'yooo'])
          t.equal(messages[0].sender.name, 'Alice')
          t.equal(messages[0].room.name, `Bob's new room`)
          teardown(alice)
          t.end()
        })
      },
      messageLimit: 0
    }).then(() => sendMessages(alice, bobsRoom, ['yo', 'yoo', 'yooo']))
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('unsubscribe from room', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: bobsRoom.id,
      hooks: {
        onNewMessage: m => {
          endWithErr(t, 'should not be called after unsubscribe')
        }
      },
      messageLimit: 0
    })
      .then(() => alice.roomSubscriptions[bobsRoom.id].cancel())
      .then(() => sendMessages(alice, bobsRoom, ['yoooo']))
      .then(() => setTimeout(() => {
        teardown(alice)
        t.end()
      }, 1000))
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

// Attachments

test('send message with malformed attachment fails', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.sendMessage({
      roomId: bobsRoom.id,
      text: 'should fail',
      attachment: { some: 'rubbish' }
    })
      .catch(err => {
        t.true(toString(err).match(/attachment/), 'attachment error')
        teardown(alice)
        t.end()
      }))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`send message with link attachment [sends a message to Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.sendMessage({
      roomId: bobsRoom.id,
      text: 'see attached link',
      attachment: { link: 'https://cataas.com/cat', type: 'image' }
    }).then(() => {
      teardown(alice)
      t.end()
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('receive message with link attachment', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.fetchMessages({ roomId: bobsRoom.id, limit: 1 })
      .then(([message]) => {
        t.equal(message.text, 'see attached link')
        t.deepEqual(message.attachment, {
          link: 'https://cataas.com/cat',
          type: 'image',
          fetchRequired: false
        })
        teardown(alice)
        t.end()
      }))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`send message with data attachment [sends a message to Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.sendMessage({
      roomId: bobsRoom.id,
      text: 'see attached json',
      attachment: {
        file: new File([JSON.stringify({ hello: 'world' })], {
          type: 'application/json'
        }),
        name: 'hello.json'
      }
    }).then(() => {
      teardown(alice)
      t.end()
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('receive message with data attachment', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.fetchMessages({ roomId: bobsRoom.id, limit: 1 })
      .then(([message]) => {
        t.equal(message.text, 'see attached json')
        t.equal(message.attachment.type, 'file')
        t.equal(message.attachment.fetchRequired, true)
        dataAttachmentUrl = message.attachment.link
        teardown(alice)
        t.end()
      }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('fetch data attachment', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.fetchAttachment({ url: dataAttachmentUrl })
      .then(attachment => {
        t.equal(attachment.file.name, 'hello.json')
        t.equal(attachment.file.bytes, 17)
        return fetch(attachment.link)
      })
      .then(res => res.json())
      .then(data => {
        t.deepEqual(data, { hello: 'world' })
        teardown(alice)
        t.end()
      }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('[setup] create Carol', t => {
  server.createUser({ id: 'carol', name: 'Carol' })
    .then(() => server.createRoom({ creatorId: 'carol', name: `Carol's room` }))
    .then(room => {
      carolsRoom = room // we'll want this in the following tests
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('subscribe to room implicitly joins', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({ roomId: carolsRoom.id })
      .then(room => {
        t.equal(room.id, carolsRoom.id)
        t.true(room.name, `Carol's room`)
        t.true(
          any(r => r.id === carolsRoom.id, alice.rooms),
          `Alice's rooms include Carol's room`
        )
        teardown(alice)
        t.end()
      })
      .catch(endWithErr(t))
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`user joined hook [Carol joins Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: bobsRoom.id,
      hooks: {
        onUserJoined: user => {
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
          teardown(alice)
          t.end()
        }
      }
    }))
    .then(() => server.apiRequest({
      method: 'PUT',
      path: `/rooms/${bobsRoom.id}/users/add`,
      body: { user_ids: ['carol'] },
      jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

// This test has to run before any tests which cause Carol to open a
// subscription (since then she will already be online)
test('user came online hook', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: bobsRoom.id,
      hooks: {
        onUserCameOnline: user => {
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
          t.equal(user.presence.state, 'online')
          teardown(alice)
          t.end()
        }
      }
    }))
    .then(() => fetchUser(t, 'carol').then(c => { carol = c }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user went offline hook', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: bobsRoom.id,
      hooks: {
        onUserWentOffline: user => {
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
          t.equal(user.presence.state, 'offline')
          teardown(alice)
          t.end()
        }
      }
    }))
    .then(() => teardown(carol))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('typing indicators', t => {
  let started
  Promise.all([
    fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: bobsRoom.id,
      hooks: {
        onUserStartedTyping: user => {
          started = Date.now()
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
        },
        onUserStoppedTyping: user => {
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
          t.true(Date.now() - started > 1000, 'fired more than 1s after start')
          teardown(alice)
          t.end()
        }
      }
    })),
    fetchUser(t, 'carol')
  ])
    .then(([x, carol]) => carol.isTypingIn({ roomId: bobsRoom.id })
      .then(() => teardown(carol)))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`user left hook [removes Carol from Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: bobsRoom.id,
      hooks: {
        onUserLeft: user => {
          t.equal(user.id, 'carol')
          t.equal(user.name, 'Carol')
          teardown(alice)
          t.end()
        }
      }
    }))
    .then(() => server.apiRequest({
      method: 'PUT',
      path: `/rooms/${bobsRoom.id}/users/remove`,
      body: { user_ids: ['carol'] },
      jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

// Cursors

test(`new read cursor hook [Bob sets his read cursor in Alice's room]`, t => {
  Promise.all([
    fetchUser(t, 'bob')
      .then(bob => bob.joinRoom({ roomId: alicesRoom.id }).then(() => bob)),
    fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom({
      roomId: alicesRoom.id,
      hooks: {
        onNewReadCursor: cursor => {
          t.equal(cursor.position, 128)
          t.equal(cursor.user.name, 'Bob')
          t.equal(cursor.room.name, `Alice's new room`)
          teardown(alice)
          t.end()
        }
      }
    }))
  ])
    .then(([bob]) => bob.setReadCursor({
      roomId: alicesRoom.id,
      position: 128
    })
      .then(() => teardown(bob))
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`get another user's read cursor before subscribing to a room fails`, t => {
  fetchUser(t, 'alice')
    .then(alice => {
      t.throws(() => alice.readCursor({
        roomId: alicesRoom.id,
        userId: 'bob'
      }), /subscribe/)
      teardown(alice)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`get another user's read cursor after subscribing to a room`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice
      .subscribeToRoom({ roomId: alicesRoom.id })
      .then(() => alice)
    )
    .then(alice => {
      const cursor = alice.readCursor({
        roomId: alicesRoom.id,
        userId: 'bob'
      })
      t.equal(cursor.position, 128)
      t.equal(cursor.user.name, 'Bob')
      t.equal(cursor.room.name, `Alice's new room`)
      teardown(alice)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('non-admin update room fails gracefully', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.updateRoom({
      roomId: bobsRoom.id,
      name: `Bob's updated room`
    })
      .then(() => t.end(`updateRoom should not resolve`))
      .catch(err => {
        t.true(toString(err).match(/permission/), 'permission error')
        teardown(alice)
        t.end()
      })
    )
  t.timeoutAfter(TEST_TIMEOUT)
})

test('non-admin delete room fails gracefully', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.deleteRoom({ roomId: bobsRoom.id })
      .then(() => t.end(`deleteRoom should not resolve`))
      .catch(err => {
        t.true(toString(err).match(/permission/), 'permission error')
        teardown(alice)
        t.end()
      })
    )
  t.timeoutAfter(TEST_TIMEOUT)
})

test('[setup] promote Alice to admin', t => {
  server.assignGlobalRoleToUser({ userId: 'alice', roleName: 'admin' })
    .then(() => t.end())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`update room [renames Bob's room]`, t => {
  let alice
  fetchUser(t, 'alice', {
    onRoomUpdated: room => {
      t.equal(room.id, bobsRoom.id)
      t.equal(room.name, `Bob's updated room`)
      teardown(alice)
      t.end()
    }
  })
    .then(a => {
      alice = a
      alice.updateRoom({
        roomId: bobsRoom.id,
        name: `Bob's updated room`
      })
    })
    .then(res => t.equal(res, undefined))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`delete room [deletes Bob's room]`, t => {
  let alice
  fetchUser(t, 'alice', {
    onRoomDeleted: room => {
      t.equal(room.id, bobsRoom.id)
      t.false(
        any(r => r.id === bobsRoom.id, alice.rooms),
        `alice.rooms doesn't contain Bob's room`
      )
      teardown(alice)
      t.end()
    }
  })
    .then(a => {
      alice = a
      alice.deleteRoom({ roomId: bobsRoom.id })
    })
    .then(res => t.equal(res, undefined))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

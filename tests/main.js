/* eslint-env browser */

import test from 'tape'
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
}).connect(map(once, hooks)).catch(endWithErr(t))

const endWithErr = curry((t, err) => t.end(`error: ${toString(err)}`))

const sendMessages = (user, room, texts) => length(texts) === 0
  ? Promise.resolve()
  : user.sendMessage({ roomId: room.id, text: head(texts) })
    .then(() => sendMessages(user, room, tail(texts)))

// Teardown first so that we can kill the tests at any time, safe in the
// knowledge that we'll always be starting with a blank slate next time

test('[teardown] destroy Alice', t => {
  server.deleteUser('alice').then(() => t.end()).catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('[teardown] destroy Bob', t => {
  server.deleteUser('bob').then(() => t.end()).catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('[teardown] destroy Carol', t => {
  server.deleteUser('carol').then(() => t.end()).catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
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

// this shouldn't be necessary once the server-side bug is fixed such
// that user deletion also leads to relevant user role deletion(s)
test('[setup] assign default role to Alice', t => {
  server.assignGlobalRoleToUser('alice', 'default')
    .then(() => t.end())
    .catch(endWithErr(t))
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
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

// User subscription

test('own read cursor undefined if not set', t => {
  fetchUser(t, 'alice')
    .then(alice => {
      t.equal(alice.readCursor(alicesRoom.id), undefined)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('new read cursor hook [Alice sets her read cursor in her room]', t => {
  Promise.all([fetchUser(t, 'alice'), fetchUser(t, 'alice', {
    newReadCursor: cursor => {
      t.equal(cursor.position, 42)
      t.equal(cursor.user.name, 'Alice')
      t.equal(cursor.room.name, `Alice's room`)
      t.end()
    }
  })])
    .then(([mobileAlice, browserAlice]) =>
      mobileAlice.setReadCursor(alicesRoom.id, 42)
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('get own read cursor', t => {
  fetchUser(t, 'alice')
    .then(alice => {
      const cursor = alice.readCursor(alicesRoom.id)
      t.equal(cursor.position, 42)
      t.equal(cursor.user.name, 'Alice')
      t.equal(cursor.room.name, `Alice's room`)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

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
    .catch(endWithErr(t))
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
  })
    .then(() => fetchUser(t, 'bob').then(b => { bob = b }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user went offline hook (user sub)', t => {
  fetchUser(t, 'alice', {
    userWentOffline: user => {
      t.equal(user.id, 'bob')
      t.equal(user.presence.state, 'offline')
      t.end()
    }
  })
    .then(() => bob.presenceSubscription.cancel())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

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
  // FIXME This test (and the corresponding room sub one) fail intermittently.
  // The corresponding server side test fails too so there might be some kind
  // of race condition in the server. Needs more investigation.
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
  })
    .then(() => server.apiRequest({
      method: 'PUT',
      path: `/rooms/${bobsRoom.id}/users/remove`,
      body: { user_ids: ['bob'] },
      jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user joined room hook (user sub) [Bob rejoins his own room]', t => {
  fetchUser(t, 'alice', {
    userJoinedRoom: (room, user) => {
      t.equal(room.id, bobsRoom.id)
      t.equal(user.id, 'bob')
      t.end()
    }
  })
    .then(() => server.apiRequest({
      method: 'PUT',
      path: `/rooms/${bobsRoom.id}/users/add`,
      body: { user_ids: ['bob'] },
      jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('room updated hook', t => {
  fetchUser(t, 'alice', {
    roomUpdated: room => {
      t.equal(room.id, bobsRoom.id)
      t.equal(room.name, `Bob's renamed room`)
      t.end()
    }
  })
    .then(() => server.apiRequest({
      method: 'PUT',
      path: `/rooms/${bobsRoom.id}`,
      body: { name: `Bob's renamed room` },
      jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`removed from room hook [removes Alice from Bob's room]`, t => {
  fetchUser(t, 'alice', {
    removedFromRoom: room => {
      t.equal(room.id, bobsRoom.id)
      t.end()
    }
  })
    .then(() => server.apiRequest({
      method: 'PUT',
      path: `/rooms/${bobsRoom.id}/users/remove`,
      body: { user_ids: ['alice'] },
      jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
    }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`room deleted hook [destroys Alice's room]`, t => {
  fetchUser(t, 'alice', {
    roomDeleted: room => {
      t.equal(room.id, alicesRoom.id)
      t.end()
    }
  })
    .then(() => server.apiRequest({
      method: 'DELETE',
      path: `/rooms/${alicesRoom.id}`,
      jwt: server.generateAccessToken({ userId: 'admin', su: true }).token
    }))
    .catch(endWithErr(t))
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
    .catch(endWithErr(t))
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
    .catch(endWithErr(t))
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

test(`send messages [sends four messages to Bob's room]`, t => {
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

test('fetch messages with pagination', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.fetchMessages(bobsRoom.id, { limit: 2 })
      .then(messages => {
        t.deepEqual(messages.map(m => m.text), ['hi', 'ho'])
        return messages[0].id
      })
      .then(initialId => alice.fetchMessages(bobsRoom.id, { initialId }))
      .then(messages => {
        t.deepEqual(messages.map(m => m.text), ['hello', 'hey'])
        t.end()
      })
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('subscribe to room and fetch initial messages', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom(
      bobsRoom.id,
      {
        newMessage: concatBatch(4, messages => {
          t.deepEqual(map(m => m.text, messages), ['hello', 'hey', 'hi', 'ho'])
          t.equal(messages[0].sender.name, 'Alice')
          t.equal(messages[0].room.name, `Bob's new room`)
          t.end()
        })
      }
    ))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('subscribe to room and fetch last two message only', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom(
      bobsRoom.id,
      {
        newMessage: concatBatch(2, messages => {
          t.deepEqual(map(m => m.text, messages), ['hi', 'ho'])
          t.end()
        })
      },
      2
    ))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('subscribe to room and receive sent messages', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom(bobsRoom.id,
      {
        newMessage: concatBatch(3, messages => {
          t.deepEqual(map(m => m.text, messages), ['yo', 'yoo', 'yooo'])
          t.equal(messages[0].sender.name, 'Alice')
          t.equal(messages[0].room.name, `Bob's new room`)
          t.end()
        })
      }, 0).then(() => sendMessages(alice, bobsRoom, ['yo', 'yoo', 'yooo']))
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('unsubscribe from room', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom(bobsRoom.id,
      {
        newMessage: once(m => {
          endWithErr(t, 'should not be called after unsubscribe')
        })
      }, 0)
      .then(() => alice.roomSubscriptions[bobsRoom.id].cancel())
      .then(() => sendMessages(alice, bobsRoom, ['yoooo']))
      .then(() => setTimeout(t.end, 1000))
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
    }))
    .catch(err => {
      t.true(toString(err).match(/attachment/), 'attachment error')
      t.end()
    })
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`send message with link attachment [sends a message to Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.sendMessage({
      roomId: bobsRoom.id,
      text: 'see attached link',
      attachment: { link: 'https://cataas.com/cat', type: 'image' }
    }))
    .then(() => t.end())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('receive message with link attachment', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.fetchMessages(bobsRoom.id, { limit: 1 }))
    .then(([message]) => {
      t.equal(message.text, 'see attached link')
      t.deepEqual(message.attachment, {
        link: 'https://cataas.com/cat',
        type: 'image',
        fetchRequired: false
      })
      t.end()
    })
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
    }))
    .then(() => t.end())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('receive message with data attachment', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.fetchMessages(bobsRoom.id, { limit: 1 }))
    .then(([message]) => {
      t.equal(message.text, 'see attached json')
      t.equal(message.attachment.type, 'file')
      t.equal(message.attachment.fetchRequired, true)
      dataAttachmentUrl = message.attachment.link
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('fetch data attachment', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.fetchAttachment(dataAttachmentUrl))
    .then(attachment => {
      t.equal(attachment.file.name, 'hello.json')
      t.equal(attachment.file.bytes, 17)
      return fetch(attachment.link)
    })
    .then(res => res.json())
    .then(data => {
      t.deepEqual(data, { hello: 'world' })
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('[setup] create Carol', t => {
  server.createUser('carol', 'Carol')
    .then(() => server.createRoom('carol', { name: `Carol's room` }))
    .then(room => {
      carolsRoom = room // we'll want this in the following tests
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('subscribe to room implicitly joins', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom(carolsRoom.id)
      .then(room => {
        t.equal(room.id, carolsRoom.id)
        t.true(room.name, `Carol's room`)
        t.true(
          any(r => r.id === carolsRoom.id, alice.rooms),
          `Alice's rooms include Carol's room`
        )
        t.end()
      })
      .catch(endWithErr(t))
    )
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`user joined hook [Carol joins Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom(bobsRoom.id, {
      userJoined: once(user => {
        t.equal(user.id, 'carol')
        t.equal(user.name, 'Carol')
        t.end()
      })
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
    .then(alice => alice.subscribeToRoom(bobsRoom.id, {
      userCameOnline: once(user => {
        t.equal(user.id, 'carol')
        t.equal(user.name, 'Carol')
        t.equal(user.presence.state, 'online')
        t.end()
      })
    }))
    .then(() => fetchUser(t, 'carol').then(c => { carol = c }))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('user went offline hook', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom(bobsRoom.id, {
      userWentOffline: once(user => {
        t.equal(user.id, 'carol')
        t.equal(user.name, 'Carol')
        t.equal(user.presence.state, 'offline')
        t.end()
      })
    }))
    .then(() => carol.presenceSubscription.cancel())
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('typing indicators', t => {
  let started
  Promise.all([
    fetchUser(t, 'alice')
      .then(alice => alice.subscribeToRoom(bobsRoom.id, {
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
      })),
    fetchUser(t, 'carol')
  ])
  // FIXME This test (and the corresponding user sub one) fail intermittently.
  // The corresponding server side test fails too so there might be some kind
  // of race condition in the server. Needs more investigation.
    .then(([x, carol]) => carol.isTypingIn(bobsRoom.id))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`user left hook [removes Carol from Bob's room]`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom(bobsRoom.id, {
      userLeft: once(user => {
        t.equal(user.id, 'carol')
        t.equal(user.name, 'Carol')
        t.end()
      })
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
      .then(bob => bob.joinRoom(alicesRoom.id).then(() => bob)),
    fetchUser(t, 'alice')
      .then(alice => alice.subscribeToRoom(alicesRoom.id, {
        newReadCursor: cursor => {
          t.equal(cursor.position, 128)
          t.equal(cursor.user.name, 'Bob')
          t.equal(cursor.room.name, `Alice's new room`)
          t.end()
        }
      }))
  ])
    .then(([bob]) => bob.setReadCursor(alicesRoom.id, 128))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`get another user's read cursor before subscribing to a room fails`, t => {
  fetchUser(t, 'alice')
    .then(alice => {
      t.throws(() => alice.readCursor(alicesRoom.id, 'bob'), /subscribe/)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`get another user's read cursor after subscribing to a room`, t => {
  fetchUser(t, 'alice')
    .then(alice => alice.subscribeToRoom(alicesRoom.id).then(() => alice))
    .then(alice => {
      const cursor = alice.readCursor(alicesRoom.id, 'bob')
      t.equal(cursor.position, 128)
      t.equal(cursor.user.name, 'Bob')
      t.equal(cursor.room.name, `Alice's new room`)
      t.end()
    })
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test('non-admin update room fails gracefully', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.updateRoom(bobsRoom.id, {
      name: `Bob's updated room`
    }))
    .then(() => t.end(`updateRoom should not resolve`))
    .catch(err => {
      t.true(toString(err).match(/permission/), 'permission error')
      t.end()
    }
    )
  t.timeoutAfter(TEST_TIMEOUT)
})

test('non-admin delete room fails gracefully', t => {
  fetchUser(t, 'alice')
    .then(alice => alice.deleteRoom(bobsRoom.id))
    .then(() => t.end(`deleteRoom should not resolve`))
    .catch(err => {
      t.true(toString(err).match(/permission/), 'permission error')
      t.end()
    })
  t.timeoutAfter(TEST_TIMEOUT)
})

test('[setup] promote Alice to admin', t => {
  server.assignGlobalRoleToUser('alice', 'admin')
    .then(() => t.end())
    .catch(endWithErr(t))
})

test(`update room [renames Bob's room]`, t => {
  fetchUser(t, 'alice', {
    roomUpdated: room => {
      t.equal(room.id, bobsRoom.id)
      t.equal(room.name, `Bob's updated room`)
      t.end()
    }
  })
    .then(alice => alice.updateRoom(bobsRoom.id, {
      name: `Bob's updated room`
    }))
    .then(res => t.equal(res, undefined))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

test(`delete room [deletes Bob's room]`, t => {
  let alice
  fetchUser(t, 'alice', {
    roomDeleted: room => {
      t.equal(room.id, bobsRoom.id)
      t.false(
        any(r => r.id === bobsRoom.id, alice.rooms),
        `alice.rooms doesn't contain Bob's room`
      )
      t.end()
    }
  })
    .then(a => {
      alice = a
      alice.deleteRoom(bobsRoom.id)
    })
    .then(res => t.equal(res, undefined))
    .catch(endWithErr(t))
  t.timeoutAfter(TEST_TIMEOUT)
})

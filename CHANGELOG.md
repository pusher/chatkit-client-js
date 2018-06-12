# Changelog

This project adheres to [Semantic Versioning Scheme](http://semver.org)

---

## [Unreleased](https://github.com/pusher/chatkit-client-js/compare/0.7.14...HEAD)

## [0.7.14](https://github.com/pusher/chatkit-client-js/compare/0.7.13...0.7.14) - 2018-06-12

### Changes

- Adds a `disconnect` method to `ChatManager` which disconnects a user from Chatkit.

## [0.7.13](https://github.com/pusher/chatkit-client-js/compare/0.7.12...0.7.13) - 2018-06-12

### Changes

- Subscriptions will now time out after 5s if no initial state is received.

## [0.7.12](https://github.com/pusher/chatkit-client-js/compare/0.7.11...0.7.12) - 2018-04-30

### Changes

- Uploads files to path scoped by user ID (no external change)

## [0.7.11](https://github.com/pusher/chatkit-client-js/compare/0.7.9...0.7.11) - 2018-04-30

### Changes

- Batch set cursor requests (no external change)

## [0.7.9](https://github.com/pusher/chatkit-client-js/compare/0.7.8...0.7.9) - 2018-04-10

### Additions

- De-duplicate user information requests.
- Send SDK info headers along with every request (version, platform, etc).

## [0.7.8](https://github.com/pusher/chatkit-client-js/compare/0.7.7...0.7.8) - 2018-04-04

### Changes

- Remove the es build because it was causing problems with webpack. If we want
  to add it back later more investigation and testing will be required.

## [0.7.7](https://github.com/pusher/chatkit-client-js/compare/0.7.6...0.7.7) - 2018-04-03

### Changes

- Point `es.js` to the es module build not the web build.

## [0.7.6](https://github.com/pusher/chatkit-client-js/compare/0.7.5...0.7.6) - 2018-04-03

### Changes

- Fill in a sensible default for missing presence data so we don't have to
  explicitly check for undefined.
- Use ES5 syntax in `es.js` to satisfy `create-react-app`'s build script.

## [0.7.5](https://github.com/pusher/chatkit-client-js/compare/0.7.4...0.7.5) - 2018-03-26

### Changes

- type check the `private` option to `updateRoom` rather than casting, so that
  default is `undefined` not `false`.

## [0.7.4](https://github.com/pusher/chatkit-client-js/compare/0.7.3...0.7.4) - 2018-03-20

### Additions

- es module build for named imports and tree shaking when consuming the SDK
  with rollup

## [0.7.3](https://github.com/pusher/chatkit-client-js/compare/0.7.2...0.7.3) - 2018-03-20

### Changes

- removed `getAllRooms` from the current user. It only causes confusion. Anyone
  using `getAllRooms` can replace swap it out for something like the following:

```javascript
// instead of this
currentUser.getAllRooms().then(allRooms => {
  doTheThing(allRooms)
})

// do this
currentUser.getJoinableRooms().then(joinable => {
  doTheThing(joinable.concat(currentUser.rooms))
})
```

## [0.7.2](https://github.com/pusher/chatkit-client-js/compare/0.7.1...0.7.2) - 2018-03-19

### Changes

- Subobjects of the current user (Rooms, Users, etc) are now mutated instead of
  replaced, so any reference to a room will represent the up to date state of
  that room.

### Fixes

- Remove chatty logs about requiring room membership after leaving a room

## [0.7.0](https://github.com/pusher/chatkit-client-js/compare/0.6.2...0.7.0) - 2018-03-13

This version represents a radical departure from 0.6.X. The interface is very
different, and there's a good chance we'll miss some of the changes in this
log. If something isn't working after migration, the best place to look first
is probably the
[documentation](https://docs.pusher.com/chatkit/reference/javascript).

### Changes

- Methods with `onSuccess`, `onFailure` callbacks changed to return promises
  instead. e.g.

```javascript
chatManager
  .connect()
  .then(currentUser => {})
  .catch(err => {})
```

- All methods take a single object parameter (see the
  [documentation](https://docs.pusher.com/chatkit/reference/javascript) for
  details on each method's arguments)

- Delegates renamed to `hooks` throughout. e.g.

```javascript
currentUser.subscribeToRoom({
  roomId,
  hooks: {
    onNewMessage: m => {}
  }
})
```

- Hooks all prefixed with `on`. e.g. `onNewMessage`, `onUserStartedTyping`

- `cursorSet` hook renamed to `onNewCursor`

- `authContext.queryParams` and `authContext.headers` both moved to the root
  options object in the token provider. e.g.

```javascript
const tokenProvider = new TokenProvider({
  url: 'your.auth.url',
  queryParams: {
    someKey: someValue,
    ...
  },
  headers: {
    SomeHeader: 'some-value',
    ...
  }
})
```

- `addUser` and `removeUser` renamed to `addUserToRoom` and `removeUserFromRoom`

- methods that used to accept a `Room` object now accept a `roomId`. e.g.

instead of

```javascript
currentUser.subscribeToRoom(myRoom, hooks) // WRONG
```

do

```javascript
currentUser.subscribeToRoom({ roomId: myRoom.id, hooks })
```

- The behaviour of read cursors has changed: in particular cursors are now
  accessed via `currentUser.readCursor` and set with
  `currentUser.setReadCursor`. See the [Read Cursors section of the
  documentation](https://docs.pusher.com/chatkit/reference/javascript#read-cursors)
  for details.

- Presence data is now accessable on any user object under `user.presence`. e.g.

```javascript
const isOnline = user.presence.state === 'online'
```

- All users that share a common room membership are accesable under
  `currentUser.users`, and all members of a room are accessable under
  `room.users`.

## [0.6.2](https://github.com/pusher/chatkit-client-js/compare/0.6.1...0.6.2) - 2018-02-05

### Fixes

- Catch errors in cursors get request

## [0.6.1](https://github.com/pusher/chatkit-client-js/compare/0.6.0...0.6.1) - 2018-01-25

### Fixes

- Made sure that the `messageLimit` argument in `subscribeToRoom` was being
  validated as a number.
- Ensured that the `position` argument in `setCursor` is a valid number.
- Throw an error if the userId isn't provided to the ChatManager.

## [0.6.0](https://github.com/pusher/chatkit-client-js/compare/0.5.1...0.6.0) - 2018-01-19

### Changes

- Simplify typing indicator API
  - removed `startedTypingIn` and `stoppedTypingIn` methods
  - instead call `isTypingIn` as frequently as you like (rate limited by the SDK)
  - `startedTyping` and `stoppedTyping` are fired exactly once each per burst
    of typing

## [0.5.1](https://github.com/pusher/chatkit-client-js/compare/0.5.0...0.5.1) - 2018-01-16

### Fixes

- Fixed `fetchMessageFromRoom` which wasn't passing along the values provided in the `FetchRoomMessagesOptions` parameter as query params. Thanks [@apalmer0](https://github.com/apalmer0)!


## [0.5.0](https://github.com/pusher/chatkit-client-js/compare/0.4.0...0.5.0) - 2018-01-09

### Changes

- `ChatManager` takes a `userId` as a required option, `TokenProvider` no
  longer does. (`ChatManager` passes the user ID to the token provider
  internally before requesting a token.)

### Additions

- `RoomDelegate` has a `cursorSet` callback, fired whenever a cursor is set in
  the given room.

- `CurrentUser` has a `setCursor` method, to set a cursor in a given room.

- The `CurrentUser` object now has a `cursors` property, which contains all the
  user's own cursors, mapped by room ID. This is guaranteed to be populated
  before room subscriptions succeed, so e.g. `currentUser.cursors[roomId]` can
  be used upon receiving messages to determine if they have been read already.


## [0.4.0](https://github.com/pusher/chatkit-client-js/compare/0.3.2...0.4.0) - 2018-01-04

### Additions

- Add initial support for receiving cursors.


## [0.3.2](https://github.com/pusher/chatkit-client-js/compare/0.3.1...0.3.2) - 2017-12-19

### Changes

- `addMessage` has been renamed to `sendMessage` and now expects a different set of parameters:

What previously would have been this:

```typescript
currentUser.addMessage(
  "Hi there! 👋",
  myRoom,
  (messageId) => {
    console.log("Success!", messageId);
  },
  (error) => {
    console.log("Error", error);
  }
)
```

now needs to be written like this:

```typescript
currentUser.sendMessage(
  {
    text: "Hey there!",
    roomId: myRoom.id,
  },
  (messageId) => {
    console.log("Success!", messageId);
  },
  (error) => {
    console.log("Error", error);
  }
)
```

### Additions

- `sendMessage` supports adding an attachment to a message. See [the docs](https://docs.pusher.com/chatkit/client/javascript#messages) for more information.


---

Older releases are not covered by this changelog.

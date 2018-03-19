# Changelog

This project adheres to [Semantic Versioning Scheme](http://semver.org)

---

## [Unreleased](https://github.com/pusher/chatkit-client-js/compare/0.7.2...HEAD)

## 0.7.2 -- 2018-03-19

### Changes

- Subobjects of the current user (Rooms, Users, etc) are now mutated instead of
  replaced, so any reference to a room will represent the up to date state of
  that room.

### Fixes

- Remove chatty logs about requiring room membership after leaving a room

## 0.7.0 -- 2018-03-13

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

## 0.6.2 -- 2018-02-05

### Fixes

- Catch errors in cursors get request

## 0.6.1 -- 2018-01-25

### Fixes

- Made sure that the `messageLimit` argument in `subscribeToRoom` was being
  validated as a number.
- Ensured that the `position` argument in `setCursor` is a valid number.
- Throw an error if the userId isn't provided to the ChatManager.

## 0.6.0 -- 2018-01-19

### Changes

- Simplify typing indicator API
  - removed `startedTypingIn` and `stoppedTypingIn` methods
  - instead call `isTypingIn` as frequently as you like (rate limited by the SDK)
  - `startedTyping` and `stoppedTyping` are fired exactly once each per burst
    of typing

## 0.5.1 -- 2018-01-16

### Fixes

- Fixed `fetchMessageFromRoom` which wasn't passing along the values provided in the `FetchRoomMessagesOptions` parameter as query params. Thanks [@apalmer0](https://github.com/apalmer0)!


## 0.5.0 -- 2018-01-09

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


## 0.4.0 -- 2018-01-04

### Additions

- Add initial support for receiving cursors.


## 0.3.2 -- 2017-12-19

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

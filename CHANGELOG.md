# Changelog

This project adheres to [Semantic Versioning Scheme](http://semver.org)

---

## [Unreleased](https://github.com/pusher/chatkit-client-js/compare/0.5.1...HEAD)

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

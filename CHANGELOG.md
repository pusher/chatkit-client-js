# Change Log

This project adheres to [Semantic Versioning Scheme](http://semver.org)

---

## Unreleased

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

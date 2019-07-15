const helpers = require("./helpers/main")

// Each test in this group will have
// * 2 clients for alice (alice and aliceMobile)
// * 1 room with Alice as the only member (room)

// Cursors point to the last read message (by the user) in a room.
// Cursors are tightly coupled with unread counts. The unread count
// for a room is the difference the number of messages sent in the
// room after the current read cursor.

describe("A read cursor", () => {
  test("invokes hook when set on other device", async () => {
    // cursor positions should be message ids, but any int is valid
    const expectedPos = 42

    await page.evaluate(
      async (roomId, expectedPos) => {
        window.actual = undefined

        // set up Alice's hook to set the global value
        await aliceChatManager.connect({
          onNewReadCursor: cursor => {
            window.actual = cursor
          },
        })

        const aliceMobile = await aliceMobileChatManager.connect()
        await aliceMobile.setReadCursor({
          roomId: roomId,
          position: expectedPos,
        })
      },
      room.id,
      expectedPos,
    )

    // wait for hook to be invoked
    await helpers.withHook(actual => {
      expect(actual.position).toBe(expectedPos)
    })
  })

  test("sets unread count", async () => {
    res = await helpers.makeSimpleMessage({
      roomId: room.id,
      userId: alice.id,
      text: "hi",
    })

    const initial = await page.evaluate(async () => {
      const alice = await aliceChatManager.connect()
      return {
        unread: alice.rooms[0].unreadCount,
        messageAt: alice.rooms[0].lastMessageAt,
      }
    })

    expect(initial.unread).toBe(1)
    expect(initial.messageAt).toBeDefined()

    // setting the cursor to the latest message sets the unread
    // count to 0
    await page.evaluate(
      async (roomId, messageId) => {
        window.actual = undefined
        const alice = await aliceChatManager.connect({
          onRoomUpdated: room =>
            (window.actual = {
              unread: alice.rooms[0].unreadCount,
              messageAt: alice.rooms[0].lastMessageAt,
            }),
        })
        alice.setReadCursor({
          roomId: roomId,
          position: messageId,
        })
      },
      room.id,
      res.id,
    )

    // wait for hook to be invoked
    await helpers.withHook(actual => {
      expect(actual.unread).toBe(0)
      expect(actual.messageAt).toBeDefined()
    })
  })

  /////////////////////////
  // Test setup
  const roleName = "cursorsRole"

  beforeAll(async () => {
    await helpers.defaultBeforeAll(roleName)
  })

  afterAll(async () => {
    await helpers.defaultAfterAll(roleName)
  })

  beforeEach(async () => {
    global.alice = await helpers.makeUser(roleName)
    global.room = await helpers.makeRoom({ members: [alice] })

    await page.evaluate(async alice => {
      window.actual = undefined

      window.aliceChatManager = makeChatManager(alice)
      window.aliceMobileChatManager = makeChatManager(alice)
    }, alice)
  })

  afterEach(async () => {
    await page.evaluate(async () => {
      aliceChatManager.disconnect()
      aliceMobileChatManager.disconnect()
    })
  })
})

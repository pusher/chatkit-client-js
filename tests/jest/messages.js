const helpers = require("./helpers/main")
const uuid = require("uuid/v4")
const got = require("got")

// Each test in this group will have
// * a room
// * bob and alice (in the room)

describe("Messages", () => {
  test("can be created through simple method", async () => {
    const expectedText = "hello"
    const actual = await page.evaluate(
      async (room, expectedText) => {
        const alice = await aliceChatManager.connect()

        await alice.subscribeToRoomMultipart({
          roomId: room.id,
          hooks: {
            onMessage: message =>
              (window.actual = {
                message: message,
              }),
          },
        })

        await alice.sendSimpleMessage({
          roomId: room.id,
          text: expectedText,
        })
      },
      room,
      expectedText,
    )

    await helpers.withHook(async actual => {
      expect(actual.message.parts[0].payload.content).toBe(expectedText)
    })
  })

  test("can be created through generic method", async () => {
    const expectedText = "hello"
    const actual = await page.evaluate(
      async (room, expectedText) => {
        const alice = await aliceChatManager.connect()

        await alice.subscribeToRoomMultipart({
          roomId: room.id,
          hooks: {
            onMessage: message =>
              (window.actual = {
                message: message,
              }),
          },
        })

        await alice.sendMultipartMessage({
          roomId: room.id,
          parts: [{ type: "text/plain", content: expectedText }],
        })
      },
      room,
      expectedText,
    )

    await helpers.withHook(async actual => {
      expect(actual.message.parts[0].payload.content).toBe(expectedText)
    })
  })

  test("can be created with attachment", async () => {
    const payload = uuid()

    const actual = await page.evaluate(
      async (room, payload) => {
        const alice = await aliceChatManager.connect()

        await alice.subscribeToRoomMultipart({
          roomId: room.id,
          hooks: {
            onMessage: async message =>
              (window.actual = {
                url: await message.parts[0].payload.url(),
              }),
          },
        })

        await alice.sendMultipartMessage({
          roomId: room.id,
          parts: [
            {
              file: new File([payload], { type: "text/plain" }),
              type: "text/plain",
            },
          ],
        })
      },
      room,
      payload,
    )

    await helpers.withHook(async actual => {
      expect(actual.url).toBeDefined()
      const res = await got(actual.url)
      expect(res.body).toBe(payload)
    })
  })

  /////////////////////////
  // Test setup
  const roleName = "messagesRole"

  beforeAll(async () => {
    await helpers.defaultBeforeAll(roleName)
  })

  afterAll(async () => {
    await helpers.defaultAfterAll(roleName)
  })

  beforeEach(async () => {
    global.alice = await helpers.makeUser(roleName)
    global.bob = await helpers.makeUser(roleName)
    global.room = await helpers.makeRoom({
      members: [alice, bob],
    })

    await page.evaluate(
      async (alice, bob) => {
        window.actual = undefined

        window.aliceChatManager = makeChatManager(alice)
        window.bobChatManager = makeChatManager(bob)
      },
      alice,
      bob,
    )
  })

  afterEach(async () => {
    await page.evaluate(async () => {
      aliceChatManager.disconnect()
      bobChatManager.disconnect()
    })
  })
})

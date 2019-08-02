const helpers = require("./helpers/main")
const uuid = require("uuid/v4")
const got = require("got")

// Each test in this group will have
// * a private room
// * bob and alice (in the room)

describe("Notifications", () => {
  test(
    "are not recieved for messages in private rooms when the tab is visible",
    async () => {
      // Bring the test tab to the front so that it is visible
      await page.bringToFront()

      const messageText = "hello"

      console.log(await page.evaluate(() => document.visibilityState))

      const actual = await page.evaluate(
        (room, messageText) =>
          new Promise(async resolve => {
            class MockNotification {
              constructor(title, options) {
                resolve({ title, options })
              }
            }

            const alice = await aliceChatManager.connect()

            await alice.enablePushNotifications({
              _Notification: MockNotification,
              _onlineOnly: true,
            })

            const bob = await bobChatManager.connect()
            await bob.sendSimpleMessage({
              roomId: room.id,
              text: messageText,
            })

            setTimeout(() => resolve("timeout"), 6000)
          }),
        room,
        messageText,
      )

      expect(actual).toBe("timeout")
    },
    10000,
  )

  test(
    "are recieved for messages in private rooms when the tab is hidden",
    async () => {
      // Create a new tab so that the test tab is hidden
      await browser.newPage()

      const messageText = "hello"

      const actual = await page.evaluate(
        (room, messageText) =>
          new Promise(async resolve => {
            class MockNotification {
              constructor(title, options) {
                resolve({ title, options })
              }
            }

            const alice = await aliceChatManager.connect()

            await alice.enablePushNotifications({
              _Notification: MockNotification,
              _onlineOnly: true,
            })

            const bob = await bobChatManager.connect()
            await bob.sendSimpleMessage({
              roomId: room.id,
              text: messageText,
            })
          }),
        room,
        messageText,
      )

      expect(actual).toEqual({
        title: room.name,
        options: {
          body: `${bob.name}: ${messageText}`,
          data: {
            pusher: { deep_link: `https://pusher.com?ck_room_id=${room.id}` },
            chatkit: { roomId: room.id },
          },
          icon: "https://pusher.com/favicon.ico",
        },
      })
    },
    10000,
  )

  /////////////////////////
  // Test setup
  const roleName = "notificationsRole"

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
      isPrivate: true,
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

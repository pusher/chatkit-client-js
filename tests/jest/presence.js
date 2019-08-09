const helpers = require("./helpers/main")
const uuid = require("uuid/v4")
const got = require("got")

// Each test in this group will have
// * a room
// * bob and alice (in the room)

describe("Presence subscription", () => {
  test(
    "triggers hook when user comes online",
    async () => {
      await page.evaluate(
        async (bob, room) => {
          const alice = await aliceChatManager.connect()

          await alice.subscribeToRoomMultipart({
            roomId: room.id,
            hooks: {
              onPresenceChanged: (state, user) => {
                if (state.current == "online" && user.id == bob.id) {
                  window.actual = {
                    state: state,
                    user: user,
                  }
                }
              },
            },
          })

          await bobChatManager.connect()
        },
        bob,
        room,
      )

      await helpers.withHook(async actual => {
        expect(actual.user.id).toBe(bob.id)
        expect(actual.state.current).toBe("online")
      })
      // we need extra time for the presence change to happen
    },
    10000,
  )

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

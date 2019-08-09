const helpers = require("./helpers/main")
const uuid = require("uuid/v4")

// Each test in this group will have
// * bob and alice

describe("Rooms", () => {
  test("can be created with name parameter only", async () => {
    const expectedName = "mushroom"
    const actual = await page.evaluate(async roomName => {
      const alice = await aliceChatManager.connect()

      return await alice.createRoom({
        name: roomName,
      })
    }, expectedName)

    expect(actual.id).toBeDefined()
    expect(actual.isPrivate).toBeFalsy()
    expect(actual.name).toBe(expectedName)
  })

  test("can be created with supplied id", async () => {
    const expectedId = uuid()
    const actual = await page.evaluate(async roomId => {
      const alice = await aliceChatManager.connect()

      return await alice.createRoom({
        id: roomId,
        name: roomId,
      })
    }, expectedId)

    expect(actual.id).toBe(expectedId)
    expect(actual.isPrivate).toBeFalsy()
    expect(actual.name).toBe(expectedId)
  })

  test("can have users added", async () => {
    const room = await helpers.makeRoom({ members: [alice] })

    await page.evaluate(
      async (bob, roomId) => {
        const alice = await aliceChatManager.connect()
        alice.subscribeToRoomMultipart({
          roomId: roomId,
          hooks: {
            onUserJoined: newUser =>
              (window.actual = {
                user: newUser,
              }),
          },
        })

        await alice.addUserToRoom({
          userId: bob.id,
          roomId: roomId,
        })
      },
      bob,
      room.id,
    )

    await helpers.withHook(actual => {
      expect(actual.user.id).toBe(bob.id)
    })
  })

  test("can have users removed", async () => {
    const room = await helpers.makeRoom({ members: [alice, bob] })

    await page.evaluate(
      async (bob, roomId) => {
        const alice = await aliceChatManager.connect()
        alice.subscribeToRoomMultipart({
          roomId: roomId,
          hooks: {
            onUserLeft: user =>
              (window.actual = {
                user: user,
              }),
          },
        })

        await alice.removeUserFromRoom({
          userId: bob.id,
          roomId: roomId,
        })
      },
      bob,
      room.id,
    )

    await helpers.withHook(actual => {
      expect(actual.user.id).toBe(bob.id)
    })
  })

  test("can be joined with correct permission", async () => {
    const room = await helpers.makeRoom({ members: [alice] })

    await page.evaluate(async roomId => {
      const alice = await aliceChatManager.connect()
      await alice.subscribeToRoomMultipart({
        roomId: roomId,
        hooks: {
          onUserJoined: user =>
            (window.actual = {
              user: user,
            }),
        },
      })

      const bob = await bobChatManager.connect()
      await bob.joinRoom({
        roomId: roomId,
      })
    }, room.id)

    await helpers.withHook(actual => {
      expect(actual.user.id).toBe(bob.id)
    })
  })

  test("can be updated", async () => {
    const room = await helpers.makeRoom({ members: [alice] })

    const updatedName = "newName"
    const updatedData = "bar"
    expect(room.name).not.toBe(updatedName)
    expect(room.customData).toBeUndefined()
    expect(room.isPrivate).toBeFalsy()

    await page.evaluate(
      async (roomId, updatedName, updatedData) => {
        const alice = await aliceChatManager.connect({
          onRoomUpdated: room => (window.actual = { room: room }),
        })
        await alice.updateRoom({
          roomId: roomId,
          name: updatedName,
          customData: { foo: updatedData },
          private: true,
        })
      },
      room.id,
      updatedName,
      updatedData,
    )

    await helpers.withHook(actual => {
      expect(actual.room.name).toBe(updatedName)
      expect(actual.room.customData.foo).toBe(updatedData)
      expect(actual.room.isPrivate).toBeTruthy()
    })
  })

  test("can be deleted", async () => {
    const room = await helpers.makeRoom({ members: [alice] })

    await page.evaluate(async roomId => {
      const alice = await aliceChatManager.connect({
        onRoomDeleted: room => (window.actual = { room: room }),
      })
      await alice.deleteRoom({
        roomId: roomId,
      })
    }, room.id)

    await helpers.withHook(actual => {
      expect(actual.room.id).toBe(room.id)
    })
  })

  /////////////////////////
  // Test setup
  const roleName = "roomsRole"

  beforeAll(async () => {
    await helpers.defaultBeforeAll(roleName)
  })

  afterAll(async () => {
    await helpers.defaultAfterAll(roleName)
  })

  beforeEach(async () => {
    global.alice = await helpers.makeUser(roleName)
    global.bob = await helpers.makeUser(roleName)

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

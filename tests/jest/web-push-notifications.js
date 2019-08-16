const helpers = require("./helpers/main")

describe("Web push notifications", () => {
  test("succeeds in registering with Beams with default ChatManager notification options", async () =>  {
    const user = await helpers.makeUser("default")
    const mockBeamsCalls = await page.evaluate(
      user =>
        makeChatManager(user)
          .connect()
          .then(user => {
            return user.enablePushNotifications()
          })
          .then(() => {
            return mockBeamsCalls;
          }),
      user,
    )
    expect(mockBeamsCalls.startHasBeenCalled).toBeTruthy()
    expect(mockBeamsCalls.stopHasBeenCalled).toEqual(false)
    expect(mockBeamsCalls.setUserIdHasBeenCalled).toBeTruthy()
    expect(mockBeamsCalls.setUserIdHasBeenCalledWithUserId).toEqual(user.id)
    expect(mockBeamsCalls.setUserIdTokenProviderFetchedToken.token).toBeTruthy()
  })

  test("registers with Beams if `showNotificationsTabClosed` is set explicitly to true", async () =>  {
    const user = await helpers.makeUser("default")
    const mockBeamsCalls = await page.evaluate(
      user =>
        makeChatManager(user)
          .connect()
          .then(user => {
            return user.enablePushNotifications({ showNotificationsTabClosed: true })
          })
          .then(() => {
            return mockBeamsCalls;
          }),
      user,
    )
    expect(mockBeamsCalls.startHasBeenCalled).toBeTruthy()
    expect(mockBeamsCalls.stopHasBeenCalled).toEqual(false)
    expect(mockBeamsCalls.setUserIdHasBeenCalled).toBeTruthy()
    expect(mockBeamsCalls.setUserIdHasBeenCalledWithUserId).toEqual(user.id)
    expect(mockBeamsCalls.setUserIdTokenProviderFetchedToken.token).toBeTruthy()
  })

  test("does NOT register with Beams if `showNotificationsTabClosed` is set to false", async () =>  {
    const user = await helpers.makeUser("default")
    const mockBeamsCalls = await page.evaluate(
      user =>
        makeChatManager(user)
          .connect()
          .then(user => {
            return user.enablePushNotifications({ showNotificationsTabClosed: false })
          })
          .then(() => {
            return mockBeamsCalls;
          }),
      user,
    )
    expect(mockBeamsCalls.startHasBeenCalled).toEqual(false)
    expect(mockBeamsCalls.stopHasBeenCalled).toBeTruthy()
    expect(mockBeamsCalls.setUserIdHasBeenCalled).toEqual(false)
    expect(mockBeamsCalls.setUserIdHasBeenCalledWithUserId).toBeNull()
    expect(mockBeamsCalls.setUserIdTokenProviderFetchedToken).toEqual(false)
  })

  beforeEach(async () => {
    await helpers.defaultBeforeAll()
  })

  afterEach(async () => {
    await helpers.defaultAfterAll()
  })
})
  
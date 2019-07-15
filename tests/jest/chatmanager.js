const helpers = require("./helpers/main")

describe("ChatManager", () => {
  test("can connect", async () => {
    const user = await helpers.makeUser("default")
    expect(
      await page.evaluate(
        user =>
          makeChatManager(user)
            .connect()
            .then(res => ({
              id: res.id,
              name: res.name,
            })),
        user,
      ),
    ).toMatchObject(user)
  })

  beforeAll(async () => {
    await helpers.defaultBeforeAll()
  })
})

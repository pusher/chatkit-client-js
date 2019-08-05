const ChatkitServer = require("@pusher/chatkit-server").default
const uuid = require("uuid/v4")

const config = require("./config/production")

async function defaultBeforeAll(roleName) {
  page.on("console", async msg => {
    const argsWithRichErrors = await Promise.all(
      msg
        .args()
        .map(arg =>
          arg
            .executionContext()
            .evaluate(arg => (arg instanceof Error ? arg.message : arg), arg),
        ),
    )
    console.log(...argsWithRichErrors)
  })

  page.on("pageerror", err => console.error("pageerror:", err))
  page.on("error", err => console.error("error:", err))

  await page.addScriptTag({ path: "./dist/web/chatkit.js" })
  await page.evaluate(config => {
    window.ChatManager = Chatkit.ChatManager
    window.TokenProvider = Chatkit.TokenProvider
    window.config = config

    window.makeChatManager = user =>
      new ChatManager({
        instanceLocator: config.INSTANCE_LOCATOR,
        userId: user.id,
        logger: {
          verbose: () => {},
          debug: () => {},
          info: console.info,
          warn: console.warn,
          error: console.error,
        },
        tokenProvider: new TokenProvider({
          url: config.TOKEN_PROVIDER_URL,
        }),
      })
  }, config)

  await makeGlobalRole(roleName)
}

async function defaultAfterAll(roleName) {
  await removeGlobalRole(roleName)
}

function makeUser(roleName) {
  const server = new ChatkitServer({
    instanceLocator: config.INSTANCE_LOCATOR,
    key: config.INSTANCE_KEY,
  })
  return server
    .createUser({
      id: uuid(),
      name: uuid(),
    })
    .then(res => {
      return server
        .assignGlobalRoleToUser({
          userId: res.id,
          name: roleName,
        })
        .then(() => res)
    })
    .then(res => ({
      id: res.id,
      name: res.name,
    }))
}

function makeRoom({ members }) {
  return new ChatkitServer({
    instanceLocator: config.INSTANCE_LOCATOR,
    key: config.INSTANCE_KEY,
  })
    .createRoom({
      id: uuid(),
      name: uuid(),
      creatorId: members[0].id,
      userIds: members.map(m => m.id),
    })
    .then(res => ({
      id: res.id,
      name: res.name,
    }))
}

function makeGlobalRole(name) {
  return new ChatkitServer({
    instanceLocator: config.INSTANCE_LOCATOR,
    key: config.INSTANCE_KEY,
  })
    .createGlobalRole({
      name: name,
      permissions: [
        "message:create",
        "room:join",
        "room:leave",
        "room:members:add",
        "room:members:remove",
        "room:get",
        "room:create",
        "room:update",
        "room:delete",
        "room:messages:get",
        "room:typing_indicator:create",
        "presence:subscribe",
        "user:get",
        "user:rooms:get",
        "file:get",
        "file:create",
        "cursors:read:get",
        "cursors:read:set",
      ],
    })
    .catch(err => {
      // role might already exist, which we'll ignore
      return
    })
}

function removeGlobalRole(name) {
  return new ChatkitServer({
    instanceLocator: config.INSTANCE_LOCATOR,
    key: config.INSTANCE_KEY,
  }).deleteGlobalRole({
    name: name,
  })
}

function makeSimpleMessage({ userId, roomId, text }) {
  return new ChatkitServer({
    instanceLocator: config.INSTANCE_LOCATOR,
    key: config.INSTANCE_KEY,
  })
    .sendSimpleMessage({
      userId,
      roomId,
      text,
    })
    .then(res => ({
      id: res.message_id,
    }))
}

function deleteMessage({ roomId, messageId }) {
  return new ChatkitServer({
    instanceLocator: config.INSTANCE_LOCATOR,
    key: config.INSTANCE_KEY,
  })
    .deleteMessage({
      roomId,
      messageId,
    })
    .then(res => ({
      id: res.message_id,
    }))
}

// withHook waits for window.actual to be set before calling the
// supplied function
async function withHook(fn) {
  while (true) {
    const actual = await page.evaluate(() => actual)
    if (actual != undefined) {
      await fn(actual)
      break
    }
    await sleep(100)
  }
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

module.exports = {
  defaultBeforeAll,
  defaultAfterAll,
  makeRoom,
  makeUser,
  makeSimpleMessage,
  deleteMessage,
  removeGlobalRole,
  withHook,
}

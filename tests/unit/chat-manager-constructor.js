import tape from "tape"

import { ChatManager } from "../../src/chat-manager.js"

const TEST_TIMEOUT = 200
const DUMMY_TOKEN_PROVIDER = {
  fetchToken: () => {},
}

function test(name, f) {
  tape(name, t => {
    t.timeoutAfter(TEST_TIMEOUT)

    f(t)
  })
}

test("chat manager constructor instanceLocator validation", t => {
  const otherRequiredValidProps = {
    tokenProvider: DUMMY_TOKEN_PROVIDER,
    userId: "luis",
  }

  t.throws(
    () =>
      new ChatManager({
        instanceLocator: undefined,
        ...otherRequiredValidProps,
      }),
    /TypeError/,
    "expected instanceLocator to be of the format x:y:z",
  )
  t.throws(
    () =>
      new ChatManager({ instanceLocator: "x:", ...otherRequiredValidProps }),
    /TypeError/,
    "expected instanceLocator to be of the format x:y:z",
  )
  t.throws(
    () =>
      new ChatManager({ instanceLocator: ":y:", ...otherRequiredValidProps }),
    /TypeError/,
    "expected instanceLocator to be of the format x:y:z",
  )
  t.throws(
    () =>
      new ChatManager({ instanceLocator: ":y:`", ...otherRequiredValidProps }),
    /TypeError/,
    "expected instanceLocator to be of the format x:y:z",
  )

  t.doesNotThrow(
    () =>
      new ChatManager({
        instanceLocator: "v1:us1:b92da0bf-ec77-443c-8d9e-9ab4b2bcf811",
        ...otherRequiredValidProps,
      }),
  )

  t.end()
})

import test from "tape"

import { handleUserSubReconnection } from "../../src/reconnection-handlers.js"

test("hello", t => {
  t.equal(typeof handleUserSubReconnection, "function")
  t.end()
})

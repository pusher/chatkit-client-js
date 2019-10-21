import tape from "tape"

import { batch } from "../../src/batch.js"

const TEST_TIMEOUT = 200

function test(name, f) {
  tape(name, t => {
    t.timeoutAfter(TEST_TIMEOUT)
    f(t)
  })
}

test("batch fires after maxWait", t => {
  let interval
  const g = batch(
    args => {
      t.deepEqual(args, [0, 1, 2, 3, 4])
      t.end()
      clearInterval(interval)
      return Promise.resolve()
    },
    45,
    100,
  )

  let n = 0
  interval = setInterval(() => {
    g(n)
    n++
  }, 10)
})

test("batch fires after maxPending", t => {
  const g = batch(
    args => {
      t.deepEqual(args, [0, 1, 2, 3, 4])
      t.end()
      return Promise.resolve()
    },
    1000,
    5,
  )

  for (let n = 0; n < 8; n++) {
    g(n)
  }
})

test("deduplication", t => {
  const g = batch(
    args => {
      t.deepEqual(args, [0, 1, 2, 3, 4])
      t.end()
      return Promise.resolve()
    },
    1000,
    5,
  )

  for (let n = 0; n < 8; n++) {
    g(n)
    g(1)
  }
})

test("firing concurrently", t => {
  let call = 0
  const g = batch(
    args => {
      switch (call) {
        case 0:
          call++
          t.deepEqual(args, [0, 1, 2])
          return resolveAfter(10).then(() => "slow")
        case 1:
          t.deepEqual(args, [3, 4, 5])
          return Promise.resolve("fast")
      }
    },
    1000,
    3,
  )

  let slowResolved
  Promise.all([0, 1, 2].map(n => g(n))).then(results => {
    t.deepEqual(results, ["slow", "slow", "slow"])
    slowResolved = true
    t.end()
  })

  Promise.all([3, 4, 5].map(n => g(n))).then(results => {
    t.false(slowResolved)
    t.deepEqual(results, ["fast", "fast", "fast"])
  })
})

test("deduplication of in progress requests", t => {
  let call = 0
  const g = batch(
    args => {
      switch (call) {
        case 0:
          call++
          t.deepEqual(args, [0, 1, 2])
          return resolveAfter(10).then(() => "slow")
        case 1:
          t.deepEqual(args, [3, 4, 5])
          return Promise.resolve("fast")
      }
    },
    1000,
    3,
  )

  Promise.all([0, 1, 2, 3, 1, 4, 1, 5, 1].map(n => g(n))).then(results => {
    t.deepEqual(results, [
      "slow",
      "slow",
      "slow",
      "fast",
      "slow",
      "fast",
      "slow",
      "fast",
      "slow",
    ])
    t.end()
  })
})

function resolveAfter(time) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), time)
  })
}

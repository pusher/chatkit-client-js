// `batch` decorates a function with lazy batching logic. Suppose
//
//     const g = batch(f, maxWait, maxPending)
//
// Then `g` is a function which takes a single argument, `arg` and returns a Promise. `g` keeps
// track of multiple calls, either for `maxWait` ms after the first call, or until it has been
// called with `maxPending` unique arguments -- whichever comes first. Then `f` is called with an
// array of all the unique arguments at once. If `f` resolves, then all the waiting calls to `g`
// resolve too; likewise if `f` rejects. Once `f` has been called, the process begins again.
export function batch(f, maxWait, maxPending) {
  const state = {
    callbacks: {},
    pending: new Set(),
    inProgress: new Set(),
  }

  return arg => {
    return new Promise((resolve, reject) => {
      if (state.pending.has(arg) || state.inProgress.has(arg)) {
        state.callbacks[arg].push({ resolve, reject })
      } else {
        state.pending.add(arg)
        state.callbacks[arg] = [{ resolve, reject }]
      }

      if (state.pending.size >= maxPending) {
        clearTimeout(state.timeout)
        fire(f, state)
        delete state.timeout
      } else if (!state.timeout) {
        state.timeout = setTimeout(() => {
          fire(f, state)
          delete state.timeout
        }, maxWait)
      }
    })
  }
}

function fire(f, state) {
  const args = []
  for (let arg of state.pending) {
    args.push(arg)
    state.inProgress.add(arg)
  }

  state.pending.clear()

  return f(args)
    .then(res => {
      for (let arg of args) {
        for (let callbacks of state.callbacks[arg]) {
          callbacks.resolve(res)
        }
        state.inProgress.delete(arg)
        delete state.callbacks[arg]
      }
    })
    .catch(err => {
      for (let arg of args) {
        for (let callbacks of state.callbacks[arg]) {
          callbacks.reject(err)
        }
        state.inProgress.delete(arg)
        delete state.callbacks[arg]
      }
    })
}

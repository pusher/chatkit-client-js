import { forEach } from "ramda"

export class Store {
  constructor() {
    this.pendingSets = [] // [{ key, value, resolve }]
    this.pendingGets = [] // [{ key, resolve }]

    this.initialize = this.initialize.bind(this)
    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.pop = this.pop.bind(this)
    this.update = this.update.bind(this)
    this.snapshot = this.snapshot.bind(this)
    this.getSync = this.getSync.bind(this)
  }

  initialize(initialStore) {
    this.store = initialStore
    forEach(({ key, value, resolve }) => {
      resolve((this.store[key] = value))
    }, this.pendingSets)
    forEach(({ key, resolve }) => {
      resolve(this.store[key])
    }, this.pendingGets)
  }

  set(key, value) {
    if (this.store) {
      this.store[key] = value
      return Promise.resolve(value)
    } else {
      return new Promise(resolve => {
        this.pendingSets.push({ key, value, resolve })
      })
    }
  }

  get(key) {
    if (this.store) {
      return Promise.resolve(this.store[key])
    } else {
      return new Promise(resolve => {
        this.pendingGets.push({ key, resolve })
      })
    }
  }

  pop(key) {
    return this.get(key).then(value => {
      delete this.store[key]
      return value
    })
  }

  update(key, f) {
    return this.get(key).then(value => this.set(key, f(value)))
  }

  // snapshot and getSync are useful for building synchronous interfaces, but
  // should only be used when we can guarantee that the information we want is
  // already in the store (i.e. we've just done an explicit fetch)

  snapshot() {
    return this.store || {}
  }

  getSync(key) {
    return this.store ? this.store[key] : undefined
  }
}

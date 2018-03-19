import { forEach } from 'ramda'

export class Store {
  pendingSets = [] // [{ key, value, resolve }]
  pendingGets = [] // [{ key, resolve }]

  initialize = initialStore => {
    this.store = initialStore
    forEach(({ key, value, resolve }) => {
      resolve(this.store[key] = value)
    }, this.pendingSets)
    forEach(({ key, resolve }) => {
      resolve(this.store[key])
    }, this.pendingGets)
  }

  set = (key, value) => {
    if (this.store) {
      return Promise.resolve(this.store[key] = value)
    } else {
      return new Promise(resolve => {
        this.pendingSets.push({ key, value, resolve })
      })
    }
  }

  get = key => {
    if (this.store) {
      return Promise.resolve(this.store[key])
    } else {
      return new Promise(resolve => {
        this.pendingGets.push({ key, resolve })
      })
    }
  }

  pop = key => this.get(key).then(value => {
    delete this.store[key]
    return value
  })

  update = (key, f) => this.get(key).then(value => this.set(key, f(value)))

  // snapshot and getSync are useful for building synchronous interfaces, but
  // should only be used when we can guarantee that the information we want is
  // already in the store (i.e. we've just done an explicit fetch)

  snapshot = () => this.store || {}

  getSync = key => this.store ? this.store[key] : undefined
}

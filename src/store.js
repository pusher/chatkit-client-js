import { clone, forEach } from 'ramda'

export class Store {
  pendingSets = [] // [{ key, value, resolve }]
  pendingGets = [] // [{ key, resolve }]

  initialize = initialStore => {
    this.store = clone(initialStore)
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

  snapshot = () => this.store || {}

  getSync = key => this.store ? this.store[key] : undefined
}

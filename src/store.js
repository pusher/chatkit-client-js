import { clone, forEachObjIndexed } from 'ramda'

export class Store {
  pending = {}

  initialize = initialStore => {
    this.store = clone(initialStore)
    forEachObjIndexed((resolve, key) => resolve(this.store[key]))
  }

  set = (key, value) => { this.store[key] = value }

  get = key => {
    if (this.store) {
      return Promise.resolve(this.store[key])
    } else {
      return new Promise(resolve => {
        this.pending[key] = resolve
      })
    }
  }

  snapshot = () => this.store
}

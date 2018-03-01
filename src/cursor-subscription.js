import { compose, forEach, map } from 'ramda'

import { parseBasicCursor } from './parsers'

export class CursorSubscription {
  constructor ({ hooks, path, cursorStore, instance }) {
    this.hooks = hooks
    this.path = path
    this.cursorStore = cursorStore
    this.instance = instance
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.hooks = { ...this.hooks, subscriptionEstablished: resolve }
      this.instance.subscribeNonResuming({
        path: this.path,
        listeners: {
          onError: reject,
          onEvent: this.onEvent
        }
      })
    })
  }

  onEvent = ({ body }) => {
    switch (body.event_name) {
      case 'initial_state':
        this.onInitialState(body.data)
        break
      case 'new_cursor':
        this.onNewCursor(body.data)
        break
    }
  }

  onInitialState = ({ cursors }) => {
    compose(
      forEach(c => this.cursorStore.set(c.userId, c.roomId, c)),
      map(parseBasicCursor)
    )(cursors)
    this.hooks.subscriptionEstablished()
  }

  onNewCursor = data => {
    const basicCursor = parseBasicCursor(data)
    this.cursorStore.set(basicCursor.userId, basicCursor.roomId, basicCursor)
      .then(() => {
        if (this.hooks.newCursor) {
          this.cursorStore.get(basicCursor.userId, basicCursor.roomId)
            .then(cursor => this.hooks.newCursor(cursor))
        }
      })
  }
}

import { compose, forEach, map } from 'ramda'

import { parseBasicCursor } from './parsers'

export class CursorSubscription {
  constructor ({ onNewCursorHook, path, cursorStore, instance, logger }) {
    this.onNewCursorHook = onNewCursorHook
    this.path = path
    this.cursorStore = cursorStore
    this.instance = instance
    this.logger = logger
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.onSubscriptionEstablished = resolve
      this.sub = this.instance.subscribeNonResuming({
        path: this.path,
        listeners: {
          onError: reject,
          onEvent: this.onEvent
        }
      })
    })
  }

  cancel () {
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug('error when cancelling cursor subscription', err)
    }
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
    this.onSubscriptionEstablished()
  }

  onNewCursor = data => {
    const basicCursor = parseBasicCursor(data)
    this.cursorStore
      .set(basicCursor.userId, basicCursor.roomId, basicCursor)
      .then(() => {
        this.cursorStore
          .get(basicCursor.userId, basicCursor.roomId)
          .then(this.onNewCursorHook)
      })
  }
}

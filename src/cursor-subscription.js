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
      this.instance.subscribeNonResuming({
        path: this.path,
        listeners: {
          onOpen: resolve,
          onError: reject,
          onEvent: this.onEvent
        }
      })
    })
  }

  onEvent = ({ body }) => {
    switch (body.event_name) {
      case 'cursor_set':
        this.onCursorSet(body.data)
        break
    }
  }

  onCursorSet = data => {
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

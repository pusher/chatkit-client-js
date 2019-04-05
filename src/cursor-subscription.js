import { parseBasicCursor } from "./parsers"
import { handleCursorSubReconnection } from "./reconnection-handlers"

export class CursorSubscription {
  constructor(options) {
    this.onNewCursorHook = options.onNewCursorHook
    this.roomId = options.roomId
    this.cursorStore = options.cursorStore
    this.instance = options.instance
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout

    this.connect = this.connect.bind(this)
    this.cancel = this.cancel.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.onInitialState = this.onInitialState.bind(this)
    this.onNewCursor = this.onNewCursor.bind(this)
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("cursor subscription timed out"))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = initialState => {
        clearTimeout(this.timeout)
        resolve(initialState)
      }
      this.sub = this.instance.subscribeNonResuming({
        path: `/cursors/0/rooms/${encodeURIComponent(this.roomId)}`,
        listeners: {
          onError: err => {
            clearTimeout(this.timeout)
            reject(err)
          },
          onEvent: this.onEvent,
        },
      })
    })
  }

  cancel() {
    clearTimeout(this.timeout)
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug("error when cancelling cursor subscription", err)
    }
  }

  onEvent({ body }) {
    switch (body.event_name) {
      case "initial_state":
        this.onInitialState(body.data)
        break
      case "new_cursor":
        this.onNewCursor(body.data)
        break
    }
  }

  onInitialState({ cursors }) {
    const basicCursors = cursors.map(c => parseBasicCursor(c))

    if (!this.established) {
      this.established = true
      Promise.all(basicCursors.map(c => this.cursorStore.set(c))).then(
        this.onSubscriptionEstablished,
      )
    } else {
      handleCursorSubReconnection({
        basicCursors,
        cursorStore: this.cursorStore,
        onNewCursorHook: this.onNewCursorHook,
      })
    }
  }

  onNewCursor(data) {
    return this.cursorStore
      .set(parseBasicCursor(data))
      .then(cursor => this.onNewCursorHook(cursor))
  }
}

import { map } from "ramda"

import { parseBasicCursor } from "./parsers"

export class CursorSubscription {
  constructor(options) {
    this.onNewCursorHook = options.onNewCursorHook
    this.path = options.path
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
        path: this.path,
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
    return Promise.all(
      map(
        c => this.cursorStore.set(c.userId, c.roomId, c),
        map(parseBasicCursor, cursors),
      ),
    ).then(this.onSubscriptionEstablished)
  }

  onNewCursor(data) {
    const basicCursor = parseBasicCursor(data)
    return this.cursorStore
      .set(basicCursor.userId, basicCursor.roomId, basicCursor)
      .then(() => {
        this.cursorStore
          .get(basicCursor.userId, basicCursor.roomId)
          .then(this.onNewCursorHook)
      })
  }
}

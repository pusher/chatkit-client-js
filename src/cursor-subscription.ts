import { parseBasicCursor } from "./parsers"
import { handleCursorSubReconnection } from "./reconnection-handlers"
import { CursorStore } from "./cursor-store";
import { Instance, Logger, Subscription } from "@pusher/platform";
import { Cursor, BasicCursor } from "./cursor";

export class CursorSubscription {
  private roomId: string;
  private cursorStore: CursorStore;
  private instance: Instance;
  private logger: Logger;
  private connectionTimeout: number;
  private timeout?: NodeJS.Timeout;
  public established: boolean = false;
  private onNewCursorHook: (cursor: BasicCursor) => void;
  private sub?: Subscription;
  private onSubscriptionEstablished?: (cursor: Cursor[]) => void;

  public constructor(options: {
    onNewCursorHook: (cursor: BasicCursor) => void,
    roomId: string,
    cursorStore: CursorStore,
    instance: Instance,
    logger: Logger,
    connectionTimeout: number,
  }) {
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

  public connect() {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("cursor subscription timed out"))
      }, this.connectionTimeout)
      this.onSubscriptionEstablished = initialState => {
        this.timeout && clearTimeout(this.timeout)
        resolve(initialState)
      }
      this.sub = this.instance.subscribeNonResuming({
        path: `/cursors/0/rooms/${encodeURIComponent(this.roomId)}`,
        listeners: {
          onError: err => {
            this.timeout && clearTimeout(this.timeout)
            reject(err)
          },
          onEvent: this.onEvent,
        },
      })
    })
  }

  public cancel() {
    this.timeout && clearTimeout(this.timeout)
    try {
      this.sub && this.sub.unsubscribe()
    } catch (err) {
      this.logger.debug("error when cancelling cursor subscription", err)
    }
  }

  private onEvent(body: any) {
    switch (body.event_name) {
      case "initial_state":
        this.onInitialState(body.data)
        break
      case "new_cursor":
        this.onNewCursor(body.data)
        break
    }
  }

  private onInitialState(cursors: any[]) {
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

  private onNewCursor(data: any) {
    return this.cursorStore
      .set(parseBasicCursor(data))
      .then((cursor: BasicCursor) => this.onNewCursorHook(cursor))
  }
}

import { parseBasicMessage } from "./parsers"
import { urlEncode } from "./utils"
import { Message, BasicMessage } from "./message"
import { UserStore } from "./user-store";
import { RoomStore } from "./room-store";
import { Instance, Logger, Subscription } from "@pusher/platform";
import { TypingIndicators } from "./typing-indicators";

export class MessageSubscription {
  private roomId: string;
  private messageLimit?: number;
  private userId: string;
  private userStore: UserStore;
  private roomStore: RoomStore;
  private typingIndicators: TypingIndicators;
  private instance: Instance;
  private logger: Logger;
  private connectionTimeout: number;
  private messageBuffer: { message: Message, ready: boolean }[];
  private onMessageHook: (message: Message) => void;

  private timeout?: NodeJS.Timeout;
  public established?: boolean;
  private sub?: Subscription;

  public constructor(options: {
    roomId: string;
    messageLimit?: number;
    userId: string;
    instance: Instance;
    userStore: UserStore;
    roomStore: RoomStore;
    typingIndicators: TypingIndicators;
    logger: Logger;
    connectionTimeout: number;
    onMessageHook: (message: Message) => void;
  }) {
    this.roomId = options.roomId
    this.messageLimit = options.messageLimit
    this.userId = options.userId
    this.instance = options.instance
    this.userStore = options.userStore
    this.roomStore = options.roomStore
    this.typingIndicators = options.typingIndicators
    this.messageBuffer = [] // { message, ready }
    this.logger = options.logger
    this.connectionTimeout = options.connectionTimeout
    this.onMessageHook = options.onMessageHook

    this.connect = this.connect.bind(this)
    this.cancel = this.cancel.bind(this)
    this.onEvent = this.onEvent.bind(this)
    this.onMessage = this.onMessage.bind(this)
    this.flushBuffer = this.flushBuffer.bind(this)
    this.onIsTyping = this.onIsTyping.bind(this)
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.timeout = setTimeout(() => {
        reject(new Error("message subscription timed out"))
      }, this.connectionTimeout)
      this.sub = this.instance.subscribeResuming({
        path: `/rooms/${encodeURIComponent(this.roomId)}?${urlEncode({
          message_limit: this.messageLimit,
        })}`,
        listeners: {
          onOpen: () => {
            this.timeout && clearTimeout(this.timeout)
            resolve()
          },
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
      this.logger.debug("error when cancelling message subscription", err)
    }
  }

  private onEvent({body}: {body: any}) {
    switch (body.event_name) {
      case "new_message":
        this.onMessage(body.data)
        break
      case "is_typing":
        this.onIsTyping(body.data)
        break
    }
  }

  private onMessage(data: any) {
    const pending = {
      message: new Message(
        parseBasicMessage(data),
        this.userStore,
        this.roomStore,
        this.instance,
      ),
      ready: false,
    }
    this.messageBuffer.push(pending)
    this.userStore
      .fetchMissingUsers([pending.message.senderId])
      .catch(err => {
        this.logger.error("error fetching missing user information:", err)
      })
      .then(() => {
        pending.ready = true
        this.flushBuffer()
      })
  }

  private flushBuffer() {
    while (this.messageBuffer.length > 0 && this.messageBuffer[0].ready) {
      const first = this.messageBuffer.shift();
      first && this.onMessageHook(first.message)
    }
  }

  private onIsTyping({user_id: userId}: {user_id: string}) {
    if (userId !== this.userId) {
      Promise.all([
        this.roomStore.get(this.roomId),
        this.userStore.get(userId),
      ]).then(([room, user]) => this.typingIndicators.onIsTyping(room, user))
    }
  }
}

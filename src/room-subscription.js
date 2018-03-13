export class RoomSubscription {
  constructor ({ hooks, messageSub, cursorSub }) {
    this.hooks = hooks
    this.messageSub = messageSub
    this.cursorSub = cursorSub
  }

  cancel () {
    this.hooks = {}
    this.messageSub.cancel()
    this.cursorSub.cancel()
  }
}

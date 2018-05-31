export class RoomSubscription {
  constructor ({ messageSub, cursorSub }) {
    this.messageSub = messageSub
    this.cursorSub = cursorSub
  }

  cancel () {
    this.messageSub.cancel()
    this.cursorSub.cancel()
  }
}

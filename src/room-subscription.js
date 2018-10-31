export class RoomSubscription {
  constructor(options) {
    this.messageSub = options.messageSub
    this.cursorSub = options.cursorSub
    this.membershipSub = options.membershipSub
  }

  connect() {
    return Promise.all([
      this.messageSub.connect(),
      this.cursorSub.connect(),
      this.membershipSub.connect(),
    ])
  }

  cancel() {
    this.messageSub.cancel()
    this.cursorSub.cancel()
    this.membershipSub.cancel()
  }
}

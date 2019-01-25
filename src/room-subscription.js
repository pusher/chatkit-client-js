export class RoomSubscription {
  constructor(options) {
    this.messageSub = options.messageSub
    this.cursorSub = options.cursorSub
    this.membershipSub = options.membershipSub
  }

  connect() {
    if (this.cancelled) {
      return Promise.reject(
        new Error("attempt to connect a cancelled room subscription"),
      )
    }
    return Promise.all([
      this.messageSub.connect(),
      this.cursorSub.connect(),
      this.membershipSub.connect(),
    ])
  }

  cancel() {
    this.cancelled = true
    this.messageSub.cancel()
    this.cursorSub.cancel()
    this.membershipSub.cancel()
  }
}

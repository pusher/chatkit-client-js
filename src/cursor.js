export class Cursor {
  constructor (basicCursor, userStore, roomStore) {
    this.position = basicCursor.position
    this.updatedAt = basicCursor.updatedAt
    this.userId = basicCursor.userId
    this.roomId = basicCursor.roomId
    this.cursorType = basicCursor.cursorType
    this.userStore = userStore
    this.roomStore = roomStore
  }

  get user () {
    return this.userStore.getSync(this.userId)
  }

  get room () {
    return this.roomStore.getSync(this.roomId)
  }
}

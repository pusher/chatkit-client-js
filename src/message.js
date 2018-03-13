export class Message {
  constructor (basicMessage, userStore, roomStore) {
    this.id = basicMessage.id
    this.senderId = basicMessage.senderId
    this.roomId = basicMessage.roomId
    this.text = basicMessage.text
    this.attachment = basicMessage.attachment
    this.createdAt = basicMessage.createdAt
    this.updatedAt = basicMessage.updatedAt
    this.userStore = userStore
    this.roomStore = roomStore
  }

  get sender () {
    return this.userStore.getSync(this.senderId)
  }

  get room () {
    return this.roomStore.getSync(this.roomId)
  }
}

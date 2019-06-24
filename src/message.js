import { Attachment } from "./attachment"

export class Message {
  constructor(basicMessage, userStore, roomStore, instance) {
    this.id = basicMessage.id
    this.senderId = basicMessage.senderId
    this.roomId = basicMessage.roomId
    this.createdAt = basicMessage.createdAt
    this.updatedAt = basicMessage.updatedAt
    this.deletedAt = basicMessage.deletedAt

    if (basicMessage.parts) {
      // v3 message
      this.parts = basicMessage.parts.map(
        ({ partType, payload }) =>
          partType === "attachment"
            ? {
                partType,
                payload: new Attachment(payload, this.roomId, instance),
              }
            : { partType, payload },
      )
    } else {
      // v2 message
      this.text = basicMessage.text
      if (basicMessage.attachment) {
        this.attachment = basicMessage.attachment
      }
    }

    this.userStore = userStore
    this.roomStore = roomStore
  }

  get sender() {
    return this.userStore.getSync(this.senderId)
  }

  get room() {
    return this.roomStore.getSync(this.roomId)
  }
}

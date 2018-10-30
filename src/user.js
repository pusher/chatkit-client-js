export class User {
  constructor(basicUser, presenceStore) {
    this.avatarURL = basicUser.avatarURL
    this.createdAt = basicUser.createdAt
    this.customData = basicUser.customData
    this.id = basicUser.id
    this.name = basicUser.name
    this.updatedAt = basicUser.updatedAt
    this.presenceStore = presenceStore
  }

  get presence() {
    return {
      state: this.presenceStore.getSync(this.id) || "unknown",
    }
  }
}

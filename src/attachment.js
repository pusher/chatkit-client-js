export class Attachment {
  constructor(basicAttachment, roomId, instance) {
    this.type = basicAttachment.type
    this.name = basicAttachment.name
    this.size = basicAttachment.size

    if (basicAttachment.customData !== undefined) {
      this.customData = basicAttachment.customData
    }

    this._id = basicAttachment._id
    this._downloadURL = basicAttachment._downloadURL
    this._expiration = basicAttachment._expiration

    this._roomId = roomId
    this._instance = instance

    this.url = this.url.bind(this)
    this.urlExpiry = this.urlExpiry.bind(this)
    this._fetchNewDownloadURL = this._fetchNewDownloadURL.bind(this)
  }

  url() {
    return this.urlExpiry().getTime() - Date.now() < 1000 * 60 * 30
      ? this._fetchNewDownloadURL()
      : Promise.resolve(this._downloadURL)
  }

  urlExpiry() {
    return this._expiration
  }

  _fetchNewDownloadURL() {
    return this._instance
      .request({
        method: "GET",
        path: `rooms/${encodeURIComponent(this._roomId)}/attachments/${
          this._id
        }`,
      })
      .then(res => {
        const { download_url, expiration } = JSON.parse(res)
        this._downloadURL = download_url
        this._expiration = new Date(expiration)
        return this._downloadURL
      })
  }
}

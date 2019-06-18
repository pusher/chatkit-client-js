import { Instance } from "@pusher/platform";
import { BasicMessagePartPayload } from "./message";

export interface AttachmentMessagePartPayload extends BasicMessagePartPayload {
  name: string;
  size: number;
  _id: string;
  _downloadURL: string;
  _expiration: Date;
}

export class Attachment {

  public type: string;
  public name: string;
  public size: number;
  public customData?: any;

  private _id: string;
  private _downloadURL: string;
  private _expiration: Date;
  private _roomId: string;
  private _instance: Instance;

  public constructor(basicAttachment: AttachmentMessagePartPayload, roomId: string, instance: Instance) {
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

  public url() {
    return this.urlExpiry().getTime() - Date.now() < 1000 * 60 * 30
      ? this._fetchNewDownloadURL()
      : Promise.resolve(this._downloadURL)
  }

  public urlExpiry() {
    return this._expiration
  }

  private _fetchNewDownloadURL() {
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

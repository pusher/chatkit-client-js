import { Attachment } from "./attachment"
import { UserStore } from "./user-store";
import { RoomStore } from "./room-store";

export interface MessagePart {
  partType: 'inline' | 'url' | 'attachment',
  payload: {
    type: string, 
    content?: string, 
    url?: string, 
    customData?: any,
    file?: File,
    name?: string,
    size?: number,
    _id?: string,
    _downloadURL?: string,
    _expiration?: Date
  }
}

export interface BasicMessage {
  id: string;
  senderId: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
  parts?: MessagePart[];

  /**
   * @deprecated Old (v2) field. Use message.parts instead.
   */
  text?: string;
    /**
   * @deprecated Old (v2) field. Use message.parts instead.
   */
  attachment?: { link: string, type: string, name: string };
}

export class Message implements BasicMessage {
  public id: string;
  public senderId: string;
  public roomId: string;
  public createdAt: string;
  public updatedAt: string;
  public parts: MessagePart[] = [];
  private userStore: UserStore;
  private roomStore: RoomStore;

  /**
   * @deprecated Old (v2) field. Use message.parts instead.
   */
  public text?: string;
      /**
   * @deprecated Old (v2) field. Use message.parts instead.
   */
  public attachment?: { link: string, type: string, name: string };
  

  public constructor(basicMessage, userStore, roomStore, instance) {
    this.id = basicMessage.id
    this.senderId = basicMessage.senderId
    this.roomId = basicMessage.roomId
    this.createdAt = basicMessage.createdAt
    this.updatedAt = basicMessage.updatedAt

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

  public get sender() {
    return this.userStore.getSync(this.senderId)
  }

  public get room() {
    return this.roomStore.getSync(this.roomId)
  }
}

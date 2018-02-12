import Attachment from './attachment';
interface BasicMessage {
    id: number;
    senderId: string;
    roomId: number;
    text: string;
    createdAt: string;
    updatedAt: string;
    attachment?: Attachment;
}
export default BasicMessage;

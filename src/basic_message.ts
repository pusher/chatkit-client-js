import FileResource from './file_resource';

interface BasicMessage {
  id: number;
  senderId: string;
  roomId: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  attachment?: FileResource;
}

export default BasicMessage;

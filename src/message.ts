import Attachment from './attachment';
import Room from './room';
import User from './user';

interface Message {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  attachment?: Attachment;
  sender: User;
  room: Room;
}

export default Message;

import FileResource from './file_resource';
import Room from './room';
import User from './user';

interface Message {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  attachment?: FileResource;
  sender: User;
  room: Room;
}

export default Message;

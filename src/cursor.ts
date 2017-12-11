import Room from './room';
import User from './user';

interface Cursor {
  cursorType: number;
  position: number;
  room: Room;
  updatedAt: string;
  user: User;
}

export default Cursor;

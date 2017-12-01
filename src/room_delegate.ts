import BasicCursor from './basic_cursor';
import Message from './message';
import User from './user';

interface RoomDelegate {
  newMessage?: (message: Message) => void;
  userStartedTyping?: (user: User) => void;
  userStoppedTyping?: (user: User) => void;

  userJoined?: (user: User) => void;
  userLeft?: (user: User) => void;

  userCameOnlineInRoom?: (user: User) => void;
  userWentOfflineInRoom?: (user: User) => void;

  // TODO: This seems like it could instead be `userListUpdated`, or something similar?
  usersUpdated?: () => void;

  error?: (error: any) => void;
  // TODO enrich
  cursorSet?: (cursor: BasicCursor) => void;
}

export default RoomDelegate;

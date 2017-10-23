import Room from './room';
import User from './user';

interface ChatManagerDelegate {
  addedToRoom?: (room: Room) => void;
  removedFromRoom?: (room: Room) => void;
  roomUpdated?: (room: Room) => void;
  roomDeleted?: (room: Room) => void;

  // These _can_ be implemented as part of the ChatManagerDelegate, but
  // the primary usage is intended at the Room level (see RoomDelegate)
  userStartedTyping?: (room: Room, user: User) => void;
  userStoppedTyping?: (room: Room, user: User) => void;
  userJoinedRoom?: (room: Room, user: User) => void;
  userLeftRoom?: (room: Room, user: User) => void;
  userCameOnline?: (user: User) => void;
  userWentOffline?: (user: User) => void;

  // TODO: Is this the best way of communicating errors? What errors are
  // communicated using this?
  error?: (error: any) => void;
}

export default ChatManagerDelegate;

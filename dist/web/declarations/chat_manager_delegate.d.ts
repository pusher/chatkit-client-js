import Room from './room';
import User from './user';
interface ChatManagerDelegate {
    addedToRoom?: (room: Room) => void;
    removedFromRoom?: (room: Room) => void;
    roomUpdated?: (room: Room) => void;
    roomDeleted?: (room: Room) => void;
    userStartedTyping?: (room: Room, user: User) => void;
    userStoppedTyping?: (room: Room, user: User) => void;
    userJoinedRoom?: (room: Room, user: User) => void;
    userLeftRoom?: (room: Room, user: User) => void;
    userCameOnline?: (user: User) => void;
    userWentOffline?: (user: User) => void;
    error?: (error: any) => void;
}
export default ChatManagerDelegate;

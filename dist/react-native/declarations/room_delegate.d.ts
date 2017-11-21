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
    usersUpdated?: () => void;
}
export default RoomDelegate;

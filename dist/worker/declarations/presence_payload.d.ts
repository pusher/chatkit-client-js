import PresenceState from './presence_state';
interface PresencePayload {
    userId: string;
    state: PresenceState;
    lastSeenAt?: string;
}
export default PresencePayload;

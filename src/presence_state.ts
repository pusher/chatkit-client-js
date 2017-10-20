export default class PresenceState {
  stringValue: string;

  constructor(state: string) {
    switch (state) {
      case 'online':
        this.stringValue = state;
        break;
      case 'offline':
        this.stringValue = state;
        break;
      default:
        this.stringValue = 'unknown';
        break;
    }
  }
}

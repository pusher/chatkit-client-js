import {
  Instance
} from 'pusher-platform';


export interface GlobalUserStoreOptions {
  instance: Instance;
}

export default class GlobalUserStore {
  private instance: Instance;

  constructor(options: GlobalUserStoreOptions) {
    this.instance = options.instance;
  }
}

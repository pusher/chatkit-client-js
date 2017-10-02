import * as PCancelable from 'p-cancelable';

export default class TokenProvider {
  authEndpoint: string;
  userId: string;

  constructor({ authEndpoint, userId }) {
    this.authEndpoint = authEndpoint;
    this.userId = userId;
  }

  fetchToken(tokenParams?: any): PCancelable<string> {
    return this.makeAuthRequest().then(responseBody => {
      return responseBody.access_token;
    });
  }

  clearToken(token?: string) {
    // TODO: Caching
  }

  makeAuthRequest(): PCancelable<string> {
    return new PCancelable<string>((onCancel, resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${this.authEndpoint}&user_id=${this.userId}`); // TODO: Fixme
      xhr.timeout = 30 * 1000; // 30 seconds
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Couldn't fetch token from ${
            this.authEndpoint
          }; got ${ xhr.status } ${ xhr.statusText }.`));
        }
      };
      xhr.ontimeout = () => {
        reject(new Error(`Request timed out while fetching token from ${
          this.authEndpoint
        }`));
      };
      xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
      xhr.send(this.urlEncode({
        grant_type: "client_credentials",
      }));
    });
  }

  private urlEncode(data: any): string {
    return Object.keys(data)
      .filter(key => data[key] !== undefined)
      .map(key => `${ key }=${ encodeURIComponent(data[key]) }`)
      .join('&');
  }

  private unixTimeNow(): number {
    return Math.floor(Date.now() / 1000);
  }
}

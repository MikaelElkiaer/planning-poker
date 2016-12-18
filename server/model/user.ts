import { UserCollection } from './userCollection';

export class User {
  get sid() { return this._sid; }
  get pid() { return this._pid; }
  get userName() { return this._userName; }
  set userName(username: string) { this._userName = username; }
  get active() { return this._active; }
  set active(active: boolean) { this._active = active; }

  private _sid: string;
  private _pid: string;
  private _userName: string;
  private _active: boolean;
  private static nextUserNumber: number = 1;
  
  constructor() {
    this._sid = User.createId();
    this._pid = User.createId();
    this._userName = User.getNextUserName();
    this._active = true;
  }

  static getNextUserName() {
    return `guest${this.nextUserNumber++}`;
  }

  static createId() {
    return Math.floor((1 + Math.random()) * 0x100000000).toString(16).substring(1);
  }

  static isValidUserName(username: string, users: UserCollection) {
    var regex = /^\w{2,12}$/;
    if (!regex.test(username))
      return false;

    var ids = Object.keys(users);
    for (var i = 0; i < ids.length; i++)
      if (users[ids[i]].username === username)
        return false;

    return true;
  }
}

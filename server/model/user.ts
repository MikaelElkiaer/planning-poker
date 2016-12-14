import { IdGenerator } from './idGenerator';
import { UserCollection } from './userCollection';

var idGenerator = new IdGenerator();

class User {
  private _sid: string;
  private _pid: string;
  private _username: string;
  private _active: boolean;
  private static _nextUsernumber: number = 1;
  
  constructor() {
    this._sid = idGenerator.Generate();
    this._pid = idGenerator.Generate();
    this._username = User.GetNextUserName();
    this._active = true;
  }

  get Sid() { return this._sid; }

  get Pid() { return this._pid; }

  get UserName() { return this._username; }
  set UserName(username: string) { this._username = username; }

  get Active() { return this._active; }
  set Active(active: boolean) { this._active = active; }

  get Public() { return { pid: this.Pid, username: this.UserName, active: this.Active }; }

  static GetNextUserName() {
    return `guest${this._nextUsernumber++}`;
  }

  static IsValidUserName(username: string, users: UserCollection) {
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

export { User };

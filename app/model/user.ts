import { IdGenerator } from './idGenerator';
var idGenerator = new IdGenerator(require('crypto'));

class User {
  private _sid: string;
  private _pid: string;
  private _username: string;
  private _active: boolean;
  private static _nextUsernumber: number = 1;
  
  constructor() {
    this._sid = idGenerator.generate();
    this._pid = idGenerator.generate();
    this._username = User.getNextUsername();
    this._active = true;
  }

  get sid() { return this._sid; }

  get pid() { return this._pid; }

  get username() { return this._username; }
  set username(username: string) { this._username = username; }

  get active() { return this._active; }
  set active(active: boolean) { this._active = active; }

  get public() { return { pid: this.pid, username: this.username, active: this.active }; }

  static getNextUsername() {
    return `guest${this._nextUsernumber++}`;
  }

  static isValidUsername(username: string, users: UserCollection) {
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

class UserCollection {
  private _users: { [id: string]: User };
  
  constructor () {
    this._users = {};
  }

  getAll(inactive: boolean = false) {
    var result = {};
    Object.keys(this._users).forEach(id => {
      var user = this._users[id];
      if (inactive || user.active)
        result[user.pid] = user.public;
    });
    return result;
  }

  addUser(id: string, user: User) {
    if (!this._users[id])
      this._users[id] = user;
    else
      throw `User with id ${id} already in userCollection.`;
  }

  removeUser(id: string) {
    if (this._users[id])
      delete this._users[id];
    else
      throw `User with id ${id} not in userCollection.`;
  }

  changeId(sid: string, id: string, activate: boolean = false) {
    var user = this.getUserBySid(sid);
    this._users[id] = this._users[user[0]];
    delete this._users[user[0]];

    if (activate)
      this._users[id].active = true;
  }

  getUserById(id: string) {
    return this._users[id];
  }

  getUserByPid(pid: string) : [string, User] {
      var ids = Object.keys(this._users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this._users[id].pid === pid)
          return [id, this._users[id]];
      }
      return null;
  }

  getUserBySid(sid: string) : [string, User] {
      var ids = Object.keys(this._users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this._users[id].sid === sid) {
          return [id, this._users[id]];
        }
      }
      return null;
  }
}

export { User, UserCollection };

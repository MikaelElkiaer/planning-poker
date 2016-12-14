import { User } from './user';
import { UserCollection } from './userCollection';

class RoomUser {
  private _user: User;
  private _ready: boolean;
  private _isHost: boolean;
  
  constructor(user: User, isHost: boolean = false) {
    this._user = user;
    this._ready = isHost;
    this._isHost = isHost;
  }

  get User() : User { return this._user; }
  get Ready() : boolean { return this._ready; }
  set Ready(value: boolean) { this._ready = value; }
  get IsHost() : boolean { return this._isHost; }

  get Public() {
    return { user: this._user.Public, ready: this._ready, isHost: this._isHost };
  }
}

class Room {
  private _users: {[id: string]: RoomUser};
  
  constructor(hostPid, user) {
    this._users = {};
    this._users[hostPid] = new RoomUser(user, true);
  }

  get Users() : {[id: string]: RoomUser} { return this._users; }

  AddUser(pid: string, user: User, isHost: boolean) { this._users[pid] = new RoomUser(user, isHost); }
  RemoveUser(pid: string) { delete this._users[pid]; }

  GetUserByPid(pid: string) : RoomUser {
    var roomUser = this._users[pid];
    if (!roomUser)
      return undefined;

    return roomUser;
  }

  GetAll() {
    var result = {};
    Object.keys(this._users).forEach(pid => {
      result[pid] = this._users[pid].Public;
    });
    return result;
  }
}

export { Room };

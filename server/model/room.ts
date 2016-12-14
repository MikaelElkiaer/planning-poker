import { User } from './user';
import { UserCollection } from './userCollection';

class RoomUser {
  private user: User;
  private ready: boolean;
  private isHost: boolean;
  
  constructor(user: User, isHost: boolean = false) {
    this.user = user;
    this.ready = isHost;
    this.isHost = isHost;
  }

  get User() : User { return this.user; }
  get Ready() : boolean { return this.ready; }
  set Ready(value: boolean) { this.ready = value; }
  get IsHost() : boolean { return this.isHost; }
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
      result[pid] = this._users[pid];
    });
    return result;
  }
}

export { Room };

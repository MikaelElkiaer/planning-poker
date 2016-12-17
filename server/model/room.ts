import { User } from './user';
import { UserCollection } from './userCollection';
import { RoomUser } from './roomUser';
import { RoomState } from '../../DTO/roomState';

class Room {
  private id: string;
  private _users: {[id: string]: RoomUser};
  private state: RoomState = RoomState.WaitingForPlayers;
  
  constructor(host: User) {
    this.id = host.Pid;
    this._users = {};
    this._users[host.Pid] = new RoomUser(host);
  }

  get Id() { return this.id; }
  get Users() { return this._users; }
  get State() { return this.state; }
  set State(value) { this.state = value; }

  AddUser(user: User) { this._users[user.Pid] = new RoomUser(user); }
  RemoveUser(pid: string) { delete this._users[pid]; }

  GetUserByPid(pid: string) : RoomUser {
    var roomUser = this._users[pid];
    if (!roomUser)
      return undefined;

    return roomUser;
  }

  GetHost(): RoomUser {
    return this._users[this.id];
  }

  GetAll(): {[id: string]: RoomUser} {
    var result = {};
    Object.keys(this._users).forEach(pid => {
      result[pid] = this._users[pid];
    });
    return result;
  }
}

export { Room };

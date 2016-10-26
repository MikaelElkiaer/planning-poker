import { User, UserCollection } from './user';

class RoomUser {
  private _user: User;
  private _ready: boolean;
  private _isHost: boolean;
  
  constructor(user: User, isHost: boolean = false) {
    this._user = user;
    this._ready = isHost;
    this._isHost = isHost;
  }

  get user() : User { return this._user; }
  get ready() : boolean { return this._ready; }
  set ready(value: boolean) { this._ready = value; }
  get isHost() : boolean { return this._isHost; }

  get public() {
    return { user: this._user.public, ready: this._ready, isHost: this._isHost };
  }
}

class Room {
  private _users: {[id: string]: RoomUser};
  
  constructor(hostPid, user) {
    this._users = {};
    this._users[hostPid] = new RoomUser(user, true);
  }

  get users() : {[id: string]: RoomUser} { return this._users; }

  addUser(pid: string, user: User, isHost: boolean) { this._users[pid] = new RoomUser(user, isHost); }
  removeUser(pid: string) { delete this._users[pid]; }

  getUserByPid(pid: string) : RoomUser {
    var roomUser = this._users[pid];
    if (!roomUser)
      return undefined;

    return roomUser;
  }

  getAll() {
    var result = {};
    Object.keys(this._users).forEach(pid => {
      result[pid] = this._users[pid].public;
    });
    return result;
  }
}

class RoomCollection {
  private _rooms: { [id: string]: Room };
  constructor() {
    this._rooms = {};
  }

  get rooms() { return this._rooms; }

  addRoom(id: string, room: Room) {
    if (!this._rooms[id])
      this._rooms[id] = room;
    else
      throw `Room with id ${id} already in roomCollection.`;
  }

  removeRoom(id: string) {
    if (this._rooms[id])
      delete this._rooms[id];
    else
      throw `Room with id ${id} not in roomCollection.`;
  }

  getRoomById(id: string) : Room { return this._rooms[id]; }
}

export { Room, RoomCollection };

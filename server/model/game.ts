import { User } from './user';
import { UserCollection } from './userCollection';
import { Player } from './player';
import { GameState } from '../../DTO/gameState';

export class Game {
  get id() { return this._id; }
  get users() { return this._users; }
  state: GameState = GameState.Waiting;
  
  private _id: string;
  private _users: {[id: string]: Player};
  
  constructor(host: User) {
    this._id = host.pid;
    this._users = {};
    this._users[host.pid] = new Player(host);
  }

  addUser(user: User) { this._users[user.pid] = new Player(user); }
  
  removeUser(pid: string) { delete this._users[pid]; }

  getUserByPid(pid: string) : Player {
    var roomUser = this._users[pid];
    if (!roomUser)
      return undefined;

    return roomUser;
  }

  getHost(): Player {
    return this._users[this._id];
  }

  getAll(): {[id: string]: Player} {
    var result = {};
    Object.keys(this._users).forEach(pid => {
      result[pid] = this._users[pid];
    });
    return result;
  }
}
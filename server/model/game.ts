import { User } from './user';
import { UserCollection } from './userCollection';
import { Player } from './player';
import { GameState } from '../../DTO/gameState';

export class Game {
  private id: string;
  private _users: {[id: string]: Player};
  private state: GameState = GameState.WaitingForPlayers;
  
  constructor(host: User) {
    this.id = host.Pid;
    this._users = {};
    this._users[host.Pid] = new Player(host);
  }

  get Id() { return this.id; }
  get Users() { return this._users; }
  get State() { return this.state; }
  set State(value) { this.state = value; }

  AddUser(user: User) { this._users[user.Pid] = new Player(user); }
  RemoveUser(pid: string) { delete this._users[pid]; }

  GetUserByPid(pid: string) : Player {
    var roomUser = this._users[pid];
    if (!roomUser)
      return undefined;

    return roomUser;
  }

  GetHost(): Player {
    return this._users[this.id];
  }

  GetAll(): {[id: string]: Player} {
    var result = {};
    Object.keys(this._users).forEach(pid => {
      result[pid] = this._users[pid];
    });
    return result;
  }
}
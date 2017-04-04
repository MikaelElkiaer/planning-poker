import { User, Player } from './';
import * as Dto from '../../shared/dto';

export class Game {
  state: Dto.GameState = Dto.GameState.Waiting;
  config: Dto.GameConfig = new Dto.GameConfig(true);
  
  get id() { return this._id; }
  get players() { return this._players; }
  get host() { return this._players[this._id]; }
  get isVoting() { return this.state === Dto.GameState.Voting; }
  
  private _id: string;
  private _players: {[id: string]: Player};
  
  constructor(host: User) {
    this._id = host.pid;
    this._players = {};
    this._players[host.pid] = new Player(host);
  }

  addPlayer(user: User) { this._players[user.pid] = new Player(user); }
  
  removePlayer(pid: string) { delete this._players[pid]; }

  getPlayerByPid(pid: string) : Player {
    var roomUser = this._players[pid];
    if (!roomUser)
      return undefined;

    return roomUser;
  }

  getAllPlayers(): {[id: string]: Player} {
    var result = {};
    Object.keys(this._players).forEach(pid => {
      result[pid] = this._players[pid];
    });
    return result;
  }

  resetCards(): void {
    Object.keys(this._players).forEach(pid => this._players[pid].currentCard = Dto.PokerCard.NotPicked);
  }
}
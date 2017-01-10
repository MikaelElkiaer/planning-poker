import { User } from './user';
import { UserCollection } from './userCollection';
import { Player } from './player';
import { GameState } from '../../DTO/gameState';
import { PokerCard } from '../../DTO/pokerCard';

export class Game {
  get id() { return this._id; }
  get players() { return this._players; }
  get host() { return this._players[this._id]; }
  state: GameState = GameState.Waiting;
  
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
    Object.keys(this._players).forEach(pid => this._players[pid].currentCard = PokerCard.NotPicked);
  }
}
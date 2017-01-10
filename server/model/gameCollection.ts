import { Game, User } from './';

export class GameCollection {
  get games() { return this._games; }
  
  private _games: { [id: string]: Game };

  constructor() {
    this._games = {};
  }

  addGame(host: User) {
    var id = host.pid;
    if (!this._games[id]) {
      var game = new Game(host);
      this._games[id] = game;
      return game;
    }
    else
      throw `Game with id ${id} already in gameCollection.`;
  }

  removeGame(id: string) {
    if (this._games[id])
      delete this._games[id];
    else
      throw `Game with id ${id} not in gameCollection.`;
  }

  getGameById(id: string) : Game {
    return this._games[id];
  }
}
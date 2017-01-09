import { Game } from './game';
import { User } from './user';

export class GameCollection {
  get rooms() { return this._rooms; }
  
  private _rooms: { [id: string]: Game };

  constructor() {
    this._rooms = {};
  }

  addRoom(host: User) {
    var id = host.pid;
    if (!this._rooms[id]) {
      var game = new Game(host);
      this._rooms[id] = game;
      return game;
    }
    else
      throw `Room with id ${id} already in roomCollection.`;
  }

  removeRoom(id: string) {
    if (this._rooms[id])
      delete this._rooms[id];
    else
      throw `Room with id ${id} not in roomCollection.`;
  }

  getRoomById(id: string) : Game {
    return this._rooms[id];
  }
}
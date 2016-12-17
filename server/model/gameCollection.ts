import { Game } from './game';
import { User } from './user';

class GameCollection {
  private rooms: { [id: string]: Game };
  constructor() {
    this.rooms = {};
  }

  get Rooms() { return this.rooms; }

  AddRoom(host: User) {
    var id = host.Pid;
    if (!this.rooms[id])
      this.rooms[id] = new Game(host);
    else
      throw `Room with id ${id} already in roomCollection.`;
  }

  RemoveRoom(id: string) {
    if (this.rooms[id])
      delete this.rooms[id];
    else
      throw `Room with id ${id} not in roomCollection.`;
  }

  GetRoomById(id: string) : Game { return this.rooms[id]; }
}

export { GameCollection };
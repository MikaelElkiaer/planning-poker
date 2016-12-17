import { Room } from './room';
import { User } from './user';

class RoomCollection {
  private rooms: { [id: string]: Room };
  constructor() {
    this.rooms = {};
  }

  get Rooms() { return this.rooms; }

  AddRoom(host: User) {
    var id = host.Pid;
    if (!this.rooms[id])
      this.rooms[id] = new Room(host);
    else
      throw `Room with id ${id} already in roomCollection.`;
  }

  RemoveRoom(id: string) {
    if (this.rooms[id])
      delete this.rooms[id];
    else
      throw `Room with id ${id} not in roomCollection.`;
  }

  GetRoomById(id: string) : Room { return this.rooms[id]; }
}

export { RoomCollection };
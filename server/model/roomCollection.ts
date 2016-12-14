import { Room } from './room';

class RoomCollection {
  private _rooms: { [id: string]: Room };
  constructor() {
    this._rooms = {};
  }

  get Rooms() { return this._rooms; }

  AddRoom(id: string, room: Room) {
    if (!this._rooms[id])
      this._rooms[id] = room;
    else
      throw `Room with id ${id} already in roomCollection.`;
  }

  RemoveRoom(id: string) {
    if (this._rooms[id])
      delete this._rooms[id];
    else
      throw `Room with id ${id} not in roomCollection.`;
  }

  GetRoomById(id: string) : Room { return this._rooms[id]; }
}

export { RoomCollection };
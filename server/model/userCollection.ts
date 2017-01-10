import { User } from './';

export class UserCollection {
  private users: { [id: string]: User };
  
  constructor () {
    this.users = {};
  }

  getAll(includeInactive: boolean = false): { [id: string]: User } {
    var result = {};
    Object.keys(this.users).forEach(id => {
      var user = this.users[id];
      if (includeInactive || user.active)
        result[user.pid] = user;
    });
    return result;
  }

  addUser(id: string, user: User) {
    if (!this.users[id])
      this.users[id] = user;
    else
      throw `User with id ${id} already in userCollection.`;
  }

  removeUser(id: string) {
    if (this.users[id])
      delete this.users[id];
    else
      throw `User with id ${id} not in userCollection.`;
  }

  changeId(sid: string, id: string, activate: boolean = false) {
    var user = this.getUserBySid(sid);
    this.users[id] = this.users[user[0]];
    delete this.users[user[0]];

    if (activate)
      this.users[id].active = true;
  }

  getUserById(id: string) {
    return this.users[id];
  }

  getUserByPid(pid: string) : [string, User] {
      var ids = Object.keys(this.users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this.users[id].pid === pid)
          return [id, this.users[id]];
      }
      return undefined;
  }

  getUserBySid(sid: string) : [string, User] {
      var ids = Object.keys(this.users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this.users[id].sid === sid) {
          return [id, this.users[id]];
        }
      }
      return undefined;
  }
}
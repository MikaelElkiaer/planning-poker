import { User } from './user';

class UserCollection {
  private users: { [id: string]: User };
  
  constructor () {
    this.users = {};
  }

  GetAll(includeInactive: boolean = false): { [id: string]: User } {
    var result = {};
    Object.keys(this.users).forEach(id => {
      var user = this.users[id];
      if (includeInactive || user.Active)
        result[user.Pid] = user;
    });
    return result;
  }

  AddUser(id: string, user: User) {
    if (!this.users[id])
      this.users[id] = user;
    else
      throw `User with id ${id} already in userCollection.`;
  }

  RemoveUser(id: string) {
    if (this.users[id])
      delete this.users[id];
    else
      throw `User with id ${id} not in userCollection.`;
  }

  ChangeId(sid: string, id: string, activate: boolean = false) {
    var user = this.GetUserBySid(sid);
    this.users[id] = this.users[user[0]];
    delete this.users[user[0]];

    if (activate)
      this.users[id].Active = true;
  }

  GetUserById(id: string) {
    return this.users[id];
  }

  GetUserByPid(pid: string) : [string, User] {
      var ids = Object.keys(this.users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this.users[id].Pid === pid)
          return [id, this.users[id]];
      }
      return undefined;
  }

  GetUserBySid(sid: string) : [string, User] {
      var ids = Object.keys(this.users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this.users[id].Sid === sid) {
          return [id, this.users[id]];
        }
      }
      return undefined;
  }
}

export { UserCollection };
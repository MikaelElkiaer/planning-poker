import { User } from './user';

class UserCollection {
  private _users: { [id: string]: User };
  
  constructor () {
    this._users = {};
  }

  GetAll(inactive: boolean = false) {
    var result = {};
    Object.keys(this._users).forEach(id => {
      var user = this._users[id];
      if (inactive || user.Active)
        result[user.Pid] = user.Public;
    });
    return result;
  }

  AddUser(id: string, user: User) {
    if (!this._users[id])
      this._users[id] = user;
    else
      throw `User with id ${id} already in userCollection.`;
  }

  RemoveUser(id: string) {
    if (this._users[id])
      delete this._users[id];
    else
      throw `User with id ${id} not in userCollection.`;
  }

  ChangeId(sid: string, id: string, activate: boolean = false) {
    var user = this.GetUserBySid(sid);
    this._users[id] = this._users[user[0]];
    delete this._users[user[0]];

    if (activate)
      this._users[id].Active = true;
  }

  GetUserById(id: string) {
    return this._users[id];
  }

  GetUserByPid(pid: string) : [string, User] {
      var ids = Object.keys(this._users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this._users[id].Pid === pid)
          return [id, this._users[id]];
      }
      return null;
  }

  GetUserBySid(sid: string) : [string, User] {
      var ids = Object.keys(this._users);
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (this._users[id].Sid === sid) {
          return [id, this._users[id]];
        }
      }
      return null;
  }
}

export { UserCollection };
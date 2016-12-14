import { UserCollection } from './userCollection';

class User {
  private sid: string;
  private pid: string;
  private username: string;
  private active: boolean;
  private static nextUserNumber: number = 1;
  
  constructor() {
    this.sid = User.CreateId();
    this.pid = User.CreateId();
    this.username = User.GetNextUserName();
    this.active = true;
  }

  get Sid() { return this.sid; }

  get Pid() { return this.pid; }

  get UserName() { return this.username; }
  set UserName(username: string) { this.username = username; }

  get Active() { return this.active; }
  set Active(active: boolean) { this.active = active; }

  static GetNextUserName() {
    return `guest${this.nextUserNumber++}`;
  }

  static CreateId() {
    return Math.floor((1 + Math.random()) * 0x100000000).toString(16).substring(1);
  }

  static IsValidUserName(username: string, users: UserCollection) {
    var regex = /^\w{2,12}$/;
    if (!regex.test(username))
      return false;

    var ids = Object.keys(users);
    for (var i = 0; i < ids.length; i++)
      if (users[ids[i]].username === username)
        return false;

    return true;
  }
}

export { User };

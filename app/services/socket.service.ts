import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { UserService } from './user.service';

@Injectable()
class SocketService {
  private socket: SocketIOClient.Socket;

  constructor(private user: UserService) { }

  connect(userSid) {
    this.socket = io.connect({ query: `userSid=${userSid}` });
    this.socket.emit('conn', null, data => {
      this.user.UserSid = data.userSid;
      this.user.UserPid = data.userPid;
      this.user.UserName = data.username;
    });

    this.on('error', e => {
      var error = JSON.parse(e);
    });
  }

  emit(eventName, data, callback) {
    this.socket.emit(eventName, data, (...args) => {
      var cArgs = args;
      if (callback) {
        callback.apply(this.socket, cArgs);
      }
    });
  }

  on(eventName, callback) {
    this.socket.on(eventName, (...args) => {
      var cArgs = args;
      callback.apply(this.socket, cArgs);
    });
  }

}

export { SocketService };

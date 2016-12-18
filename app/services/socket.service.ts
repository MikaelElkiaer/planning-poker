import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { UserService } from './user.service';
import * as DTO from '../../DTO';

@Injectable()
export class SocketService {
  private socket: SocketIOClient.Socket;

  constructor(private user: UserService) { }

  connect(userSid: string) {
    this.socket = io.connect({ query: `userSid=${userSid}` });
    this.socket.emit('conn', null, (user: DTO.UserConnect) => {
      this.user.userSid = user.sid;
      this.user.userPid = user.pid;
      this.user.userName = user.userName;
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

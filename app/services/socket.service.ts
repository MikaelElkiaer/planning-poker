import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { UserService } from './user.service';
import { UserConnect }  from '../../dto/userConnect';
import { IEmitRequest } from '../../dto/emitRequest';
import { IEmitResponse } from '../../dto/emitResponse';
import { IOnResponse } from '../../dto/onResponse';

@Injectable()
export class SocketService {
  private socket: SocketIOClient.Socket;

  constructor(private user: UserService) { }

  connect(userSid: string) {
    this.socket = io.connect({ query: `userSid=${userSid}` });
    this.emit<null, UserConnect>('conn', { data: null }, response => {
      this.user.userSid = response.data.sid;
      this.user.userPid = response.data.pid;
      this.user.userName = response.data.userName;
    });
  }

  emit<T, S>(eventName: string, request: IEmitRequest<T>, callback: (arg: IEmitResponse<S>) => void) {
    this.socket.emit(eventName, request, (...args) => {
      var cArgs = args;
      if (callback) {
        callback.apply(this.socket, cArgs);
      }
    });
  }

  on<T>(eventName, callback: (arg: IOnResponse<T>) => void) {
    this.socket.on(eventName, (...args) => {
      var cArgs = args;
      callback.apply(this.socket, cArgs);
    });
  }

  removeAllListeners() {
    this.socket.removeAllListeners();
  }
}

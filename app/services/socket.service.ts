import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { UserService } from './user.service';
import { UserConnect }  from '../../shared/dto/userConnect';
import { IEmitRequest } from '../../shared/message/emitRequest';
import { IEmitResponse } from '../../shared/message/emitResponse';
import { IOnResponse } from '../../shared/message/onResponse';

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

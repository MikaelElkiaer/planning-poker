import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { UserService } from './user.service';
import { UserConnect }  from '../../DTO/userConnect';
import { IEmitRequest } from '../../DTO/emitRequest';
import { IEmitResponse } from '../../DTO/emitResponse';
import { IOnResponse } from '../../DTO/onResponse';

@Injectable()
export class SocketService {
  private socket: SocketIOClient.Socket;

  constructor(private user: UserService) { }

  connect(userSid: string) {
    this.socket = io.connect({ query: `userSid=${userSid}` });
    this.emit<null, UserConnect>('conn', null, (data, error) => {
      this.user.userSid = data.sid;
      this.user.userPid = data.pid;
      this.user.userName = data.userName;
    });
  }

  emit<T, S>(eventName: string, request: IEmitRequest<T>, response: IEmitResponse<S>) {
    this.socket.emit(eventName, request.data, (...args) => {
      var cArgs = args;
      if (response) {
        response.apply(this.socket, cArgs);
      }
    });
  }

  on<T>(eventName, callback: IOnResponse<T>) {
    this.socket.on(eventName, (...args) => {
      var cArgs = args;
      callback.apply(this.socket, cArgs);
    });
  }

  removeAllListeners() {
    this.socket.removeAllListeners();
  }
}

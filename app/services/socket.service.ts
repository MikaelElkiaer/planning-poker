import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { UserService } from './user.service';
import * as Dto from '../../shared/dto';
import * as Msg from '../../shared/message';

@Injectable()
export class SocketService {
  private socket: SocketIOClient.Socket;

  constructor(private user: UserService) { }

  connect(userSid: string) {
    this.socket = io.connect({ query: `userSid=${userSid}` });
    this.emit<null, Dto.UserConnect>('conn', { data: null }, response => {
      this.user.userSid = response.data.sid;
      this.user.userPid = response.data.pid;
      this.user.userName = response.data.userName;
    });
  }

  emit<T, S>(eventName: string, request: Msg.IEmitRequest<T>, callback: (arg: Msg.IEmitResponse<S>) => void) {
    this.socket.emit(eventName, request, (...args) => {
      var cArgs = args;
      if (callback) {
        callback.apply(this.socket, cArgs);
      }
    });
  }

  on<T>(eventName, callback: (arg: Msg.IOnResponse<T>) => void) {
    this.socket.on(eventName, (...args) => {
      var cArgs = args;
      callback.apply(this.socket, cArgs);
    });
  }

  removeAllListeners() {
    this.socket.removeAllListeners();
  }
}

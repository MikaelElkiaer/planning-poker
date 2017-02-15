import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { ToasterService } from 'angular2-toaster';

import { UserService } from './user.service';
import * as Dto from '../../shared/dto';
import * as Msg from '../../shared/message';

@Injectable()
export class SocketService {
  private socket: SocketIOClient.Socket;

  constructor(
    private user: UserService,
    private toaster: ToasterService
    ) { }

  connect(userSid: string, userName: string): Promise<Dto.UserConnect> {
    var query = `userSid=${userSid}`;
    if (userName)
      query += `&userName=${userName}`;

    this.socket = io.connect({ query });
    return this.emit<null, Dto.UserConnect>('conn');
  }

  emit<T, S>(eventName: string, request?: Msg.IEmitRequest<T>): Promise<S> {
    return new Promise<S>((resolve, reject) => {
      this.socket.emit(eventName, request || { data: null }, (response: Msg.IEmitResponse<S>) => {
        if (response.error) {
          console.error(response.error);
          this.toaster.pop('error', null, response.error);
          reject(response.error);
        }
        else {
          resolve(response.data);
        }
      });
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

import { EventEmitter, Injectable, Output } from '@angular/core';
import * as io from 'socket.io-client';
import { ToasterService } from 'angular2-toaster';

import { UserService } from './user.service';
import * as Dto from '../../shared/dto';
import * as Msg from '../../shared/message';

@Injectable()
export class SocketService {
  @Output() socketStateEventEmitter: EventEmitter<SocketState> = new EventEmitter<SocketState>(true);
  get state(): SocketState { return this.socketState; }

  private socket: SocketIOClient.Socket;
  private socketState: SocketState = SocketState.Disconnected;

  constructor(
    private user: UserService,
    private toaster: ToasterService
  ) {
    this.connect();
    this.setUpEventListeners();
  }

  private async connect() {
    this.initializeConnection(this.user.userSid, this.user.userName);
    this.socket.connect();
    let userConnect = await this.emit<null, Dto.UserConnect>('conn');
    this.user.updateUser(userConnect.sid, userConnect.pid, userConnect.userName);

    this.socketState = SocketState.Connected;
    this.socketStateEventEmitter.emit(this.socketState);
  }

  private async disconnect() {
    this.socket.disconnect();
    this.socketState = SocketState.Disconnected;
    this.socketStateEventEmitter.emit(this.socketState);
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

  removeListeners(events: SocketEvent[]) {
    events.forEach(e => {
      this.socket.removeEventListener(e.eventName);
    });
  }

  private initializeConnection(userSid: string, userName: string) {
    var query = `userSid=${userSid}`;
    if (userName)
      query += `&userName=${userName}`;

    this.socket = io.connect({ query, autoConnect: false });
  }

  private setUpEventListeners() {
    addEventListener('online', e => {
      this.connect();
    });

    addEventListener('offline', e => {
      this.disconnect();
    });
  }
}

export class SocketEvent {
  constructor(
    public eventName: string,
    public callback: (arg: Msg.IOnResponse<any>) => void
  ) {}
}

export enum SocketState {
  Unknown = 0,
  Connected = 1,
  Disconnected = 2
}
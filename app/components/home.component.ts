import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';

import { SocketService } from '../services/socket.service';
import { UserPublic } from '../../shared/dto/userPublic';
import { GamePublic } from '../../shared/dto/gamePublic';
import { IEmitRequest } from '../../shared/message/emitRequest';
import { IEmitResponse } from '../../shared/message/emitResponse';
import { IOnResponse } from '../../shared/message/onResponse';

@Component({
  templateUrl: 'views/home'
})
export class HomeComponent implements OnDestroy {
  users: { [id: string]: UserPublic } = { };
  joinModel: { gameId: string, spectate: boolean } = { gameId: '', spectate: false };
  get usersList() {
    return Object.keys(this.users).map(pid => this.users[pid]);
  }

  constructor(private socket: SocketService, private router: Router, private toaster: ToasterService) {
    this.socket.emit<null,{[id: string]: UserPublic}>('home', { data: null }, response => {
      this.users = response.data;
      console.info('Requested home users: %o', response.data);
    });

    this.socket.on<UserPublic>('user:connect', response => {
      this.users[response.data.pid] = response.data;
      console.info('User connected: %o', response.data);
    });

    this.socket.on<UserPublic>('user:disconnect', response => {
      delete this.users[response.data.pid];
      console.info('User disconnected: %o', response.data);
    });

    this.socket.on<UserPublic>('user:change-username', response => {
      this.users[response.data.pid].userName = response.data.userName;
    });
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
  }

  onJoinGame() {
    console.info('Joining game: ', this.joinModel);
    this.router.navigate(['/game', this.joinModel.gameId], { queryParams: { spectate: this.joinModel.spectate }});
  }

  onCreateGame() {
    console.info('Creating game');
    this.socket.emit<null, GamePublic>('create-game', null, response => {
      if (response.error)
        this.toaster.pop('error', null, response.error);
      else
        this.router.navigate(['/game', response.data.gameId]);
    });
  }
}

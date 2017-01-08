import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { SocketService } from '../services/socket.service';
import { UserPublic } from '../../DTO/userPublic';
import { GamePublic } from '../../DTO/gamePublic';
import { IEmitRequest } from '../../DTO/emitRequest';
import { IEmitResponse } from '../../DTO/emitResponse';
import { IOnResponse } from '../../DTO/onResponse';

@Component({
  templateUrl: 'views/home'
})
export class HomeComponent implements OnDestroy {
  users: { [id: string]: UserPublic } = { };
  joinModel: { gameId: string, spectate: boolean } = { gameId: '', spectate: false };
  get usersList() {
    return Object.keys(this.users).map(pid => this.users[pid]);
  }

  constructor(private socket: SocketService, private router: Router) {
    this.socket.emit<null,UserPublic[]>('home', { data: null }, (data, error) => {
      this.users = data.reduce((prev, cur) => prev[cur.pid] = cur, {});
      console.info('Requested home users: %o', data);
    });

    this.socket.on<UserPublic>('user:connect', data => {
      this.users[data.pid] = data;
      console.info('User connected: %o', data);
    });

    this.socket.on<UserPublic>('user:disconnect', data => {
      delete this.users[data.pid];
      console.info('User disconnected: %o', data);
    });

    this.socket.on<UserPublic>('user:change-username', data => {
      this.users[data.pid].userName = data.userName;
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
    this.socket.emit<null, GamePublic>('create-game', null, (data, error) => {
      if (error)
        console.info(error);
      else
        this.router.navigate(['/game', data.gameId]);
    });
  }
}

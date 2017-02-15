import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SocketService } from '../services/index';
import * as Dto from '../../shared/dto/index';

@Component({
  templateUrl: 'views/home'
})
export class HomeComponent implements OnDestroy, OnInit {
  users: { [id: string]: Dto.UserPublic } = { };
  joinModel: { gameId: string, spectate: boolean } = { gameId: '', spectate: false };
  get usersList() {
    return Object.keys(this.users).map(pid => this.users[pid]);
  }

  constructor(
    private socket: SocketService,
    private router: Router
    ) { }

  async ngOnInit() {
    try {
      let users = await this.socket.emit<null,{[id: string]: Dto.UserPublic}>('home', { data: null });

      this.users = users;
      console.info('Requested home users: %o', users);
    }
    catch (error) {
      return;
    }

    this.socket.on<Dto.UserPublic>('user:connect', response => {
      this.users[response.data.pid] = response.data;
      console.info('User connected: %o', response.data);
    });

    this.socket.on<Dto.UserPublic>('user:disconnect', response => {
      delete this.users[response.data.pid];
      console.info('User disconnected: %o', response.data);
    });

    this.socket.on<Dto.UserPublic>('user:change-username', response => {
      var user = this.users[response.data.pid];

      var oldUserName = user.userName;
      var newUserName = response.data.userName;

      this.users[response.data.pid].userName = newUserName;
      console.log('User changed name: "%s" -> "%s"', oldUserName, newUserName);
    });
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
  }

  onJoinGame() {
    console.info('Joining game: ', this.joinModel);
    this.router.navigate(['/game', this.joinModel.gameId], { queryParams: { spectate: this.joinModel.spectate }});
  }

  async onCreateGame() {
    console.info('Creating game');
    try {
      let game = await this.socket.emit<null, Dto.GamePublic>('create-game', null);
      console.info('Created game: %o', game);
      this.router.navigate(['/game', game.gameId]);
    }
    catch (error) {
      return;
    }
  }
}

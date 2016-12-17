import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { SocketService } from '../services/socket.service';
import * as DTO from '../../DTO';

@Component({
  templateUrl: 'views/home'
})
export class HomeComponent {
  users: { [id: string]: DTO.UserPublic } = { };
  joinModel: { gameId: string } = { gameId: '' };

  constructor(private socket: SocketService) {
    this.socket.emit('home', null, (users: { [id: string]: DTO.UserPublic }) => {
      this.users = users;
      console.info('Requested home users: %o', users);
    });

    this.socket.on('user:connect', (user: DTO.UserPublic) => {
      this.users[user.Pid] = user;
      console.info('User connected: %o', user);
    });

    this.socket.on('user:disconnect', (user: DTO.UserPublic) => {
      delete this.users[user.Pid];
      console.info('User disconnected: %o', user);
    });
  }

  public UsersList() {
    return Object.keys(this.users).map(pid => this.users[pid]);
  }

  public OnJoinGame() {
    console.info('Joining game with id: %s', this.joinModel.gameId);
  }

  public OnCreateGame() {
    console.info('Creating game');
  }
}

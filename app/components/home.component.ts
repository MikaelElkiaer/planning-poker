import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { SocketService } from '../services/socket.service';
import { UserPublic } from '../../DTO/userPublic';

@Component({
  templateUrl: 'views/home'
})
export class HomeComponent implements OnDestroy {
  users: { [id: string]: UserPublic } = { };
  joinModel: { gameId: string } = { gameId: '' };
  get usersList() {
    return Object.keys(this.users).map(pid => this.users[pid]);
  }

  constructor(private socket: SocketService, private router: Router) {
    this.socket.emit('home', null, (users: { [id: string]: UserPublic }) => {
      this.users = users;
      console.info('Requested home users: %o', users);
    });

    this.socket.on('user:connect', (user: UserPublic) => {
      this.users[user.pid] = user;
      console.info('User connected: %o', user);
    });

    this.socket.on('user:disconnect', (user: UserPublic) => {
      delete this.users[user.pid];
      console.info('User disconnected: %o', user);
    });

    this.socket.on('user:change-username', (user: UserPublic) => {
      this.users[user.pid].userName = user.userName;
    });
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
  }

  onJoinGame() {
    console.info('Joining game with id: %s', this.joinModel.gameId);
    this.router.navigate(['/game', this.joinModel.gameId]);
  }

  onCreateGame() {
    console.info('Creating game');
    this.socket.emit('create-game', null, (error: string, gameId: string) => {
      if (error)
        console.info(error);
      else
        this.router.navigate(['/game', gameId]);
    });
  }
}

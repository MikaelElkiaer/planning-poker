import { Component } from '@angular/core';

import { SocketService } from '../services/socket.service';
import { ValuesPipe } from '../pipes/values.pipe';
import * as DTO from '../../DTO';

@Component({
  templateUrl: 'views/home'
})
export class HomeComponent {
  users: { [id: string]: DTO.UserPublic } = { };

  constructor(private socket: SocketService) {
    this.socket.emit('home', null, (users: { [id: string]: DTO.UserPublic }) => {
      this.users = users;
    });

    this.socket.on('user:connect', (user: DTO.UserPublic) => {
      this.users[user.Pid] = user;
    });

    this.socket.on('user:disconnect', (user: DTO.UserPublic) => {
      delete this.users[user.Pid];
    });

    this.socket.on('user:create-room', (room: DTO.Room) => {
      
    });
  }
}

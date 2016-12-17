import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as DTO from '../../DTO';
import { SocketService } from '../services/socket.service';

@Component({
  templateUrl: 'views/game'
})
export class GameComponent implements OnInit {
  private gameId: string;
  private players: { [id: string]: DTO.PlayerPublic } = {};

  constructor(private route: ActivatedRoute, private socket: SocketService) {
    
  }

  ngOnInit() {
    this.gameId = this.route.snapshot.params['id'];

    this.socket.emit('join-game', { gameId: this.gameId }, (error, data) => {
      if (error)
        console.info(error);
      else {
        this.players = data;
        console.info('Requested game players: %o', data);
      }
    });
  }

  get GameId() { return this.gameId; }
  get PlayersList() { return Object.keys(this.players).map(pid => this.players[pid]); }
}
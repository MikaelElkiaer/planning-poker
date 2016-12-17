import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as DTO from '../../DTO';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';

@Component({
  templateUrl: 'views/game',
  styles: [`.vote {
              display: inline-block;
              margin: 10px;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
            }

            div.user, div.user div.poker-card {
              border-color: #357ebd;
              color: #357ebd;
            }

            .user:hover, .pickable:hover {
              background-color: #f5f5f5;
              cursor:  pointer;
            }

            div.poker-card {
              background: lightgrey;
              color: black;
              margin: auto;
              width: 70px;
              line-height: 100px;
              font-size: 28px;
              text-align: center;
              border: 2px solid black;
              border-radius: 5px;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }

            .selected div.poker-card {
              border-color: #357ebd;
              color: #357ebd;
              font-weight: bold;
            }`]
})
export class GameComponent implements OnInit {
  private gameId: string;
  private players: { [id: string]: DTO.PlayerPublic } = {};
  private hostPid: string = '';

  constructor(private route: ActivatedRoute, private socket: SocketService, private user: UserService) {
    
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

    this.socket.on('user:join-game', (player: DTO.PlayerPublic) => {
      this.players[player.User.Pid] = player;
      console.info('Player joined: %o', player);
    });
  }

  get GameId() { return this.gameId; }
  get UserPid() { return this.user.UserPid; }
  get HostPid() { return this.hostPid; }
  get PlayersList() {
    return Object.keys(this.players)
      .map(pid => this.players[pid])
      .sort((a, b) => this.strcmp(a.User.UserName, b.User.UserName)); }

  private strcmp(a: string, b: string) {
    return (a == b) ? 0 : ((a > b) ? 1 : -1);
  }
}
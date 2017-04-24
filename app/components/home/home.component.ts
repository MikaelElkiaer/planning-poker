import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { SocketState, SocketService } from '../../services/index';
import * as Dto from '../../../shared/dto/index';
import { GameViewModel } from './gameViewModel';
import { SocketComponent } from '../shared/index';
import { CLIENT_EVENTS as C, SERVER_EVENTS as S } from '../../../shared/events/index';

@Component({
  templateUrl: 'views/home'
})
export class HomeComponent extends SocketComponent {
  public users: { [id: string]: Dto.User } = { };
  public games: { [id: string]: GameViewModel } = { };
  public joinModel: { spectate: boolean } = { spectate: false };
  
  get usersList() {
    return Object.keys(this.users).map(pid => this.users[pid]);
  }
  get gamesList() {
    return Object.keys(this.games).map(id => this.games[id]);
  }

  constructor(
    private router: Router,
    socket: SocketService
    ) {
      super(socket);
    }

  async onCreateGame() {
    console.info('Creating game');
    try {
      let game = await this.emit<null, Dto.Game>(S.createGame, null);
      console.info('Created game: %o', game);
      this.router.navigate(['/game', game.gameId]);
    }
    catch (error) {
      return;
    }
  }

  async handleStateChange(state) {
    if (state === SocketState.Connected) {
      try {
        this.setUpSocketEvents();
        let home = await this.emit<null, Dto.Lobby>(S.home, { data: null });

        this.users = home.users;
        this.games = this.createGameViewModels(home.games, home.users);
        console.info('Requested home users: %o', home.users);
        console.info('Requested games: %o', home.games);
      }
      catch (error) {
        return;
      }
    }
  }

  private setUpSocketEvents() {
    this.on<Dto.User>(C.user.connect, response => {
      this.users[response.data.pid] = response.data;
      console.info('User connected: %o', response.data);
    });

    this.on<Dto.User>(C.user.disconnect, response => {
      delete this.users[response.data.pid];
      console.info('User disconnected: %o', response.data);
    });

    this.on<Dto.User>(C.user.changeUserName, response => {
      var user = this.users[response.data.pid];

      var oldUserName = user.userName;
      var newUserName = response.data.userName;

      this.users[response.data.pid].userName = newUserName;

      Object.keys(this.games).forEach(gid => {
        this.games[gid].game.players[response.data.pid].user.userName = newUserName;
      });

      console.log('User changed name: "%s" -> "%s"', oldUserName, newUserName);
    });

    this.on<Dto.Game>(C.game.stateChange, response => {
      let game = response.data;
      this.games[game.gameId].game = game;
    });

    this.on<Dto.Game>(C.game.create, response => {
      let game = response.data;
      this.games[game.gameId] = new GameViewModel(game);
    });

    this.on<Dto.Game>(C.game.hostQuit, response => {
      let game = response.data;
      delete this.games[game.gameId];
    });
  }

  private createGameViewModels(games: {[id: string]: Dto.Game}, users: {[id: string]: Dto.User}): {[id: string]: GameViewModel} {
    let gameViewModels: {[id: string]: GameViewModel} = {};

    Object.keys(games).forEach(gid => {
      gameViewModels[gid] = new GameViewModel(games[gid]);
    });

    return gameViewModels;
  }
}

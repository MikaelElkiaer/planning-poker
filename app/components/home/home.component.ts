import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SocketState, SocketService } from '../../services/index';
import * as Dto from '../../../shared/dto/index';
import { GameViewModel } from './gameViewModel';

@Component({
  templateUrl: 'views/home',
  styleUrls: ['app/style/home.css']
})
export class HomeComponent implements OnDestroy, OnInit {
  public users: { [id: string]: Dto.UserPublic } = { };
  public games: { [id: string]: GameViewModel } = { };
  public joinModel: { spectate: boolean } = { spectate: false };
  
  get usersList() {
    return Object.keys(this.users).map(pid => this.users[pid]);
  }
  get gamesList() {
    return Object.keys(this.games).map(id => this.games[id]);
  }

  private socketState: SocketState;
  private socketStateSubscription;

  constructor(
    private socket: SocketService,
    private router: Router
    ) {
      this.socketState = socket.state;
    }

  async ngOnInit() {
    await this.handleStateChange(this.socket.state);

    this.socketStateSubscription = this.socket.socketStateEventEmitter.subscribe(async state => this.handleStateChange(state));

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
    this.socketStateSubscription.unsubscribe();
  }

  onJoinGame(gameId: string) {
    console.info('Joining game: ', gameId);
    this.router.navigate(['/game', gameId], { queryParams: { spectate: this.joinModel.spectate }});
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

  private async handleStateChange(state) {
    if (state === SocketState.Connected) {
      try {
        let home = await this.socket.emit<null, Dto.Home>('home', { data: null });

        this.users = home.users;
        this.games = this.createGameViewModels(home.games, home.users);
        console.info('Requested home users: %o', home.users);
        console.info('Requested games: %o', home.games);
      }
      catch (error) {
        return;
      }
    }

    this.socketState = state;
  }

  private createGameViewModels(games: {[id: string]: Dto.GamePublic}, users: {[id: string]: Dto.UserPublic}): {[id: string]: GameViewModel} {
    let gameViewModels: {[id: string]: GameViewModel} = {};

    Object.keys(games).forEach(gid => {
      gameViewModels[gid] = new GameViewModel(games[gid]);
    });

    return gameViewModels;
  }
}

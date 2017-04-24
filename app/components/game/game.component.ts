import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToasterService } from 'angular2-toaster';

import * as Dto from '../../../shared/dto/index';
import { SocketState, SocketService, UserService } from '../../services/index';
import { CardModalComponent, ConfigModalComponent, KickModalComponent } from '../index';
import { SocketComponent } from '../shared/index';
import { CLIENT_EVENTS as C, SERVER_EVENTS as S } from '../../../shared/events/index';

@Component({
  templateUrl: 'views/game'
})
export class GameComponent extends SocketComponent {
  get gameId() { return this._gameId; }
  get userPid() { return this.user.userPid; }
  get hostPid() { return this._hostPid; }
  get playersList() {
    return Object.keys(this.players)
      .map(pid => this.players[pid])
      .sort((a, b) => this.strcmp(a.user.userName, b.user.userName));
  }
  get isVoting() { return this.state === Dto.GameState.Voting; }
  get isHost() { return this.hostPid === this.userPid; }
  state: Dto.GameState = Dto.GameState.Waiting;
  config: Dto.GameConfig = undefined;

  private _gameId: string;
  private spectate: boolean;
  private players: { [id: string]: Dto.Player } = {};
  private _hostPid: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private user: UserService,
    private modalService: NgbModal,
    private toaster: ToasterService,
    socket: SocketService
    ) {
      super(socket);
    }

  ngOnInit() {
    this._gameId = this.route.snapshot.params['id'];
    this.spectate = this.route.snapshot.queryParams['spectate'] === "true";
    
    super.ngOnInit();
  }

  async startStopGame() {
    var newState = this.state === Dto.GameState.Voting ? Dto.GameState.Waiting : Dto.GameState.Voting;
    let game = await this.emit<Dto.ChangeGameState, Dto.Game>(S.changeGameState, { data: new Dto.ChangeGameState(this._gameId, newState) });
  }

  async leaveGame() {
    if (this.spectate) {
      this.router.navigate(['']);
      return;
    }
    
    try {
      let x = await this.emit<Dto.LeaveGame, void>(S.leaveGame, { data: new Dto.LeaveGame(this._gameId) });
    }
    catch (error) {
      return;
    }
    
    this.router.navigate(['']);
    console.log('Left game: %s', this.gameId);
  }

  async kickModal(player: Dto.Player) {
    const modalRef = this.modalService.open(KickModalComponent, { size: 'sm' });
    modalRef.componentInstance.player = player;

    modalRef.result.then(async () => {
      try {
        let x = await this.emit<Dto.KickPlayer, void>(S.kickPlayer, { data: new Dto.KickPlayer(this._gameId, player.user.pid) });
      }
      catch (error) {
        return;
      }
      
      delete this.players[player.user.pid];
      console.info('Kicked player: %o', player);
    }, () => {
      return;
    });
  }

  async cardModal() {
    const modalRef = this.modalService.open(CardModalComponent, { size: 'lg' });
    modalRef.componentInstance.currentCard = this.players[this.userPid].currentCard;

    modalRef.result.then(async card => {
      try {
        let x = await this.emit<Dto.ChooseCard, void>(S.chooseCard, { data: new Dto.ChooseCard(this._gameId, card) });
      }
      catch (error) {
        return;
      }
      
      this.players[this.userPid].currentCard = card;
      console.info('Selected card: %s', card);
    }, () => {
      return;
    });
  }

  async configModal() {
    const modalRef = this.modalService.open(ConfigModalComponent, { size: 'lg' });
    let componentInstance = (modalRef.componentInstance as ConfigModalComponent);
    componentInstance.config = this.config;
    componentInstance.isHost = this.isHost;

    modalRef.result.then(async (newConfig: Dto.GameConfig) => {
      try {
        let config = await this.emit<Dto.ChangeGameConfig, Dto.GameConfig>(S.changeGameConfig, { data: new Dto.ChangeGameConfig(this.gameId, newConfig) });
        this.config = config;
        
        console.info('Updated config: ', config);
      }
      catch (error) {
        return;
      }
    }, () => {
      return;
    });
  }

  private strcmp(a: string, b: string) {
    return (a == b) ? 0 : ((a > b) ? 1 : -1);
  }

  async handleStateChange(state: SocketState) {
    if (state === SocketState.Connected) {
      try {
        this.setUpSocketEvents();
        let game = await this.emit<Dto.JoinGame, Dto.Game>(S.joinGame, { data: new Dto.JoinGame(this._gameId, this.spectate) });
        
        this.players = game.players;
        this._hostPid = game.hostPid;
        this.state = game.gameState;
        this.config = game.config;
        console.info('Joined game: %o', game);
      }
      catch (error) {
          this.router.navigate(['']);
          return;
      }
    }
  }

  private setUpSocketEvents() {
    this.on<Dto.Player>(C.user.joinGame, response => {
      this.players[response.data.user.pid] = response.data;
      console.info('Player joined: %o', response.data);
    });

    this.on<Dto.User>(C.user.connect, response => {
      if (!this.players[response.data.pid])
        return;

      this.players[response.data.pid].user.active = true;
      console.info('Player active: %o', this.players[response.data.pid]);
    });

    this.on<Dto.User>(C.user.disconnect, response => {
      if (!this.players[response.data.pid])
        return;
      
      this.players[response.data.pid].user.active = false;
      console.info('Player inactive: %o', this.players[response.data.pid]);
    });

    this.on<Dto.User>(C.user.changeUserName, response => {
      var player = this.players[response.data.pid];

      if (!player)
        return;
      
      var oldName = player.user.userName;
      var newName = response.data.userName;
      this.players[response.data.pid].user.userName = newName;
      console.info('Player changed name: "%s" -> "%s"', oldName, newName)
    });

    this.on<Dto.Game>(C.host.changeGameState, response => {
      this.state = response.data.gameState;
      this.players = response.data.players;
      console.info('Host changed game state: %o', response.data);
    });

    this.on<Dto.Player>(C.user.chooseCard, response => {
      this.players[response.data.user.pid] = response.data;
      console.info('Player chose card: %o', response.data);
    });

    this.on<Dto.Player>(C.user.leaveGame, response => {
      if (response.data.user.pid === this.userPid) {
        this.toaster.pop('warning', null, `You were kicked from game with id: ${this.gameId}`);
        this.router.navigate(['']);
      }
      else {
        delete this.players[response.data.user.pid];
        console.info('Player left: %o', response.data);
      }
    });

    this.on<Dto.Game>(C.host.changeGameConfig, response => {
      this.config = response.data.config;
      console.info('Host changed game config: %o', response.data.config);
    });
  }
}
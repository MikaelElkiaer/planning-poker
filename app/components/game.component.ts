import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterService } from 'angular2-toaster';

import * as Dto from '../../shared/dto/index';
import { SocketService, UserService } from '../services/index';
import { CardModalComponent, KickModalComponent } from './index';

@Component({
  templateUrl: 'views/game'
})
export class GameComponent implements OnDestroy, OnInit {
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

  private _gameId: string;
  private spectate: boolean;
  private players: { [id: string]: Dto.PlayerPublic } = {};
  private _hostPid: string = '';

  constructor(private route: ActivatedRoute, private router: Router, private socket: SocketService, private user: UserService,
        private modalService: NgbModal, private toaster: ToasterService) {
    
  }

  ngOnInit() {
    this._gameId = this.route.snapshot.params['id'];
    this.spectate = this.route.snapshot.queryParams['spectate'] == "true";

    this.socket.emit<Dto.JoinGame, Dto.GamePublic>('join-game', { data: new Dto.JoinGame(this._gameId, this.spectate) }, response => {
      if (response.error) {
        this.toaster.pop('error', null, response.error);
        this.router.navigate(['']);
        return;
      }
      this.players = response.data.players;
      this._hostPid = response.data.hostPid;
      this.state = response.data.gameState;
      console.info('Joined game: %o', response.data);
    });

    this.socket.on<Dto.PlayerPublic>('user:join-game', response => {
      this.players[response.data.user.pid] = response.data;
      console.info('Player joined: %o', response.data);
    });

    this.socket.on<Dto.UserPublic>('user:connect', response => {
      if (!this.players[response.data.pid])
        return;

      this.players[response.data.pid].user.active = true;
      console.info('Player active: %o', this.players[response.data.pid]);
    });

    this.socket.on<Dto.UserPublic>('user:disconnect', response => {
      if (!this.players[response.data.pid])
        return;
      
      this.players[response.data.pid].user.active = false;
      console.info('Player inactive: %o', this.players[response.data.pid]);
    });

    this.socket.on<Dto.UserPublic>('user:change-username', response => {
      var player = this.players[response.data.pid];

      if (!player)
        return;
      
      var oldName = player.user.userName;
      var newName = response.data.userName;
      this.players[response.data.pid].user.userName = newName;
      console.info('Player changed name: "%s" -> "%s"', oldName, newName)
    });

    this.socket.on<Dto.GamePublic>('host:change-game-state', response => {
      this.state = response.data.gameState;
      this.players = response.data.players;
      console.info('Host changed game state: %o', response.data);
    });

    this.socket.on<Dto.PlayerPublic>('user:choose-card', response => {
      this.players[response.data.user.pid] = response.data;
      console.info('Player chose card: %o', response.data);
    });

    this.socket.on<Dto.PlayerPublic>('user:leave-game', response => {
      if (response.data.user.pid === this.userPid) {
        this.toaster.pop('warning', null, `You were kicked from game with id: ${this.gameId}`);
        this.router.navigate(['']);
      }
      else {
        delete this.players[response.data.user.pid];
        console.info('Player left: %o', response.data);
      }
    });
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
  }

  startStopGame() {
    var newState = this.state === Dto.GameState.Voting ? Dto.GameState.Waiting : Dto.GameState.Voting;
    this.socket.emit<Dto.ChangeGameState, Dto.GamePublic>('change-game-state', { data: new Dto.ChangeGameState(this._gameId, newState) }, response => {
      if (response.error)
        this.toaster.pop('error', null, response.error);
    });
  }

  leaveGame() {
    this.socket.emit<Dto.LeaveGame, null>('leave-game', { data: new Dto.LeaveGame(this._gameId)}, response => {
      if (response.error) {
        this.toaster.pop('error', null, response.error);
        return;
      }
      this.router.navigate(['']);
      console.log('Left game: %s', this.gameId);
    });
  }

  kickModal(player: Dto.PlayerPublic) {
    const modalRef = this.modalService.open(KickModalComponent, { size: 'sm' });
    modalRef.componentInstance.player = player;

    modalRef.result.then(() => {
      this.socket.emit<Dto.KickPlayer, null>('kick-player', { data: new Dto.KickPlayer(this._gameId, player.user.pid) }, response => {
        if (response.error) {
          this.toaster.pop('error', null, response.error);
          return;
        }
        delete this.players[player.user.pid];
        console.info('Kicked player: %o', player);
      });
    }, () => {
      return;
    });
  }

  cardModal() {
    const modalRef = this.modalService.open(CardModalComponent, { size: 'lg' });
    modalRef.componentInstance.currentCard = this.players[this.userPid].currentCard;

    modalRef.result.then(card => {
      this.socket.emit<Dto.ChooseCard, null>('choose-card', { data: new Dto.ChooseCard(this._gameId, card) }, response => {
        if (response.error) {
          this.toaster.pop('error', null, response.error);
          return;
        }
        this.players[this.userPid].currentCard = card;
        console.info('Selected card: %s', card);
      });
    }, () => {
      return;
    });
  }

  private strcmp(a: string, b: string) {
    return (a == b) ? 0 : ((a > b) ? 1 : -1);
  }
}
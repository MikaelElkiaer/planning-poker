import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GameState } from '../../DTO/gameState';
import { UserPublic } from '../../DTO/userPublic';
import { PlayerPublic } from '../../DTO/playerPublic';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { CardModalComponent } from './card-modal.component';

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

            .pickable:hover {
              background-color: #f5f5f5;
              cursor:  pointer;
            }

            div.poker-card {
              box-shadow: 2px 2px 4px #bbbbbb;
              margin: auto;
              padding-top: 50%;
              width: 70px;
              height: 100px;
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
            }
            
            .inactive {
              color: #ff4136;
            }
            
            .username.inactive {
              font-style: italic;
            }`]
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
  get isVoting() { return this.state === GameState.Voting; }
  state: GameState = GameState.Waiting;

  private _gameId: string;
  private spectate: boolean;
  private players: { [id: string]: PlayerPublic } = {};
  private _hostPid: string = '';

  constructor(private route: ActivatedRoute, private socket: SocketService, private user: UserService, private modalService: NgbModal) {
    
  }

  ngOnInit() {
    this._gameId = this.route.snapshot.params['id'];
    this.spectate = this.route.snapshot.queryParams['spectate'];

    this.socket.emit('join-game', { gameId: this._gameId, spectate: this.spectate }, (error, data) => {
      if (error) {
        console.info(error);
        return;
      }
      this.players = data.players;
      this._hostPid = data.hostPid;
      this.state = data.gameState;
      console.info('Requested game: %o', data);
    });

    this.socket.on('user:join-game', (player: PlayerPublic) => {
      this.players[player.user.pid] = player;
      console.info('Player joined: %o', player);
    });

    this.socket.on('user:connect', (user: UserPublic) => {
      if (!this.players[user.pid])
        return;

      this.players[user.pid].user.active = true;
      console.info('Player became active: %o', this.players[user.pid]);
    });

    this.socket.on('user:disconnect', (user: UserPublic) => {
      if (!this.players[user.pid])
        return;
      
      this.players[user.pid].user.active = false;
      console.info('Player becamse inactive: %o', this.players[user.pid]);
    });

    this.socket.on('user:change-username', (user: UserPublic) => {
      if (!this.players[user.pid])
        return;
      
      this.players[user.pid].user.userName = user.userName;
    });

    this.socket.on('host:change-game-state', (data) => {
      this.state = data.gameState;
      this.players = data.players;
      console.info('Host changed game state: %s', this.state);
    });

    this.socket.on('user:choose-card', (data) => {
      this.players[data.user.pid] = data;
      console.info('Player chose card: %s', data);
    });
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
  }

  startStopGame() {
    var newState = this.state === GameState.Voting ? GameState.Waiting : GameState.Voting;
    this.socket.emit('change-game-state', { gameId: this._gameId, gameState: newState }, (error, data) => {
      if (error)
        console.info(error);
      else {
        this.state = data.gameState;
        this.players = data.players;
        console.info('Game state changed: %s', this.state);
      }
    });
  }

  cardModal() {
    const modalRef = this.modalService.open(CardModalComponent, { size: 'lg' });
    modalRef.componentInstance.currentCard = this.players[this.userPid].currentCard;

    modalRef.result.then(card => {
      this.socket.emit('choose-card', { gameId: this._gameId, newCard: card }, (error, data) => {
        if (error) {
          console.info(error);
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
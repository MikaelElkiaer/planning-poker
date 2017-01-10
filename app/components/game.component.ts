import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GameState } from '../../dto/gameState';
import { UserPublic } from '../../dto/userPublic';
import { PlayerPublic } from '../../dto/playerPublic';
import { GamePublic } from '../../dto/gamePublic';
import { JoinGame } from '../../dto/joinGame';
import { ChangeGameState } from '../../dto/changeGameState';
import { ChooseCard } from '../../dto/chooseCard';
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

    this.socket.emit<JoinGame,GamePublic>('join-game', { data: new JoinGame(this._gameId, this.spectate) }, response => {
      if (response.error) {
        console.info(response.error);
        return;
      }
      this.players = response.data.players;
      this._hostPid = response.data.hostPid;
      this.state = response.data.gameState;
      console.info('Requested game: %o', response.data);
    });

    this.socket.on<PlayerPublic>('user:join-game', response => {
      this.players[response.data.user.pid] = response.data;
      console.info('Player joined: %o', response.data);
    });

    this.socket.on<UserPublic>('user:connect', response => {
      if (!this.players[response.data.pid])
        return;

      this.players[response.data.pid].user.active = true;
      console.info('Player became active: %o', this.players[response.data.pid]);
    });

    this.socket.on<UserPublic>('user:disconnect', response => {
      if (!this.players[response.data.pid])
        return;
      
      this.players[response.data.pid].user.active = false;
      console.info('Player becamse inactive: %o', this.players[response.data.pid]);
    });

    this.socket.on<UserPublic>('user:change-username', response => {
      if (!this.players[response.data.pid])
        return;
      
      this.players[response.data.pid].user.userName = response.data.userName;
    });

    this.socket.on<GamePublic>('host:change-game-state', response => {
      this.state = response.data.gameState;
      this.players = response.data.players;
      console.info('Host changed game state: %s', this.state);
    });

    this.socket.on<PlayerPublic>('user:choose-card', response => {
      this.players[response.data.user.pid] = response.data;
      console.info('Player chose card: %s', response.data);
    });
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
  }

  startStopGame() {
    var newState = this.state === GameState.Voting ? GameState.Waiting : GameState.Voting;
    this.socket.emit<ChangeGameState,GamePublic>('change-game-state', { data: new ChangeGameState(this._gameId, newState) }, response => {
      if (response.error)
        console.info(response.error);
    });
  }

  cardModal() {
    const modalRef = this.modalService.open(CardModalComponent, { size: 'lg' });
    modalRef.componentInstance.currentCard = this.players[this.userPid].currentCard;

    modalRef.result.then(card => {
      this.socket.emit<ChooseCard,null>('choose-card', { data: new ChooseCard(this._gameId, card) }, response => {
        if (response.error) {
          console.info(response.error);
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
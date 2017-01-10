import { User } from './';
import * as Dto from '../../shared/dto';

export class Player {
  get user() { return this._user; }
  get currentCard() { return this._currentCard; }
  set currentCard(value) { this._currentCard = value; }

  private _user: User;
  private _currentCard: Dto.PokerCard = Dto.PokerCard.NotPicked;
  
  constructor(user: User) {
    this._user = user;
  }
}
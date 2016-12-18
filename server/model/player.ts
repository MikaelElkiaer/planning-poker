import { User } from './user';
import { PokerCard } from '../../DTO/pokerCard';

export class Player {
  get user() { return this._user; }
  get currentCard() { return this._currentCard; }

  private _user: User;
  private _currentCard: PokerCard = PokerCard.None;
  
  constructor(user: User) {
    this._user = user;
  }
}
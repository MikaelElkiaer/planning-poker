import { User } from './user';
import { PokerCard } from '../../DTO/pokerCard';

class Player {
  private user: User;
  private currentCard: PokerCard = PokerCard.None;
  
  constructor(user: User) {
    this.user = user;
  }

  get User() : User { return this.user; }
  get CurrentCard() : PokerCard { return this.currentCard; }
}

export { Player };
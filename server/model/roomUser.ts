import { User } from './user';
import { PokerCard } from '../../DTO/pokerCard';

class RoomUser {
  private user: User;
  private currentCard: PokerCard = PokerCard.QuestionMark;
  
  constructor(user: User) {
    this.user = user;
  }

  get User() : User { return this.user; }
  get CurrentCard() : PokerCard { return this.currentCard; }
}

export { RoomUser };
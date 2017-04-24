import { User } from './user';
import { PokerCard } from './pokerCard';

export class Player {
    constructor(
        public user: User,
        public currentCard: PokerCard
    ) {}
}
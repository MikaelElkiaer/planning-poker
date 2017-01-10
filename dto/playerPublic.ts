import { UserPublic } from './userPublic';
import { PokerCard } from './pokerCard';

export class PlayerPublic {
    constructor(
        public user: UserPublic,
        public currentCard: PokerCard
    ) {}
}
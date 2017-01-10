import { PokerCard } from './pokerCard';

export class ChooseCard {
    constructor(
        public gameId: string,
        public newCard: PokerCard
    ) {}
}
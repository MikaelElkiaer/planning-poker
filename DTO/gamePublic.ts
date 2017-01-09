import { GameState } from './gameState';
import { PlayerPublic } from './playerPublic';

export class GamePublic {
    constructor(
        public gameId: string,
        public gameState: GameState,
        public hostPid: string,
        public players: { [id: string]: PlayerPublic }
    ) {}
}
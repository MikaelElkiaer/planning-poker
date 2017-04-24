import { GameConfig, GameState, Player } from './index';

export class Game {
    constructor(
        public gameId: string,
        public gameState: GameState,
        public hostPid: string,
        public players: { [id: string]: Player },
        public config: GameConfig
    ) {}
}
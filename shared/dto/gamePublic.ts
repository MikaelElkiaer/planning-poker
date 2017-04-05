import { GameConfig, GameState, PlayerPublic } from './index';

export class GamePublic {
    constructor(
        public gameId: string,
        public gameState: GameState,
        public hostPid: string,
        public players: { [id: string]: PlayerPublic },
        public config: GameConfig
    ) {}
}
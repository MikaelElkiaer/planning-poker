import { GameState } from './gameState';

export class ChangeGameState {
    constructor (
        public gameId: string,
        public gameState: GameState
    ) {}
}
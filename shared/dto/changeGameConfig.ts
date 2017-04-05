import { GameConfig } from './index';

export class ChangeGameConfig {
    constructor(
        public gameId: string,
        public gameConfig: GameConfig
    ) {}
}
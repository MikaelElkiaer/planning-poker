import { GamePublic } from '../../../shared/dto/index';

export class GameViewModel {
    constructor(
        public game: GamePublic,
        public gameName: string,
        public playersCount: number
    ) {}
}
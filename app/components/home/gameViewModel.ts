import { Game, User } from '../../../shared/dto/index';

export class GameViewModel {
    private get host() { return this.game.players[this.game.hostPid]; }

    public get gameId() { return this.game.gameId; }
    public get gameName() { return `${this.host.user.userName}'s game`; }
    public get playersCount() { return Object.keys(this.game.players).length; }

    constructor(
        public game: Game
    ) {}
}
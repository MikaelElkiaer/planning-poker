import { User } from './user';
import { Game } from './game';

export class Lobby {
    constructor(
        public users: {[id: string]: User},
        public games: {[id: string]: Game}
    ) {}
}
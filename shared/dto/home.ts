import { UserPublic } from './userPublic';
import { GamePublic } from './gamePublic';

export class Home {
    constructor(
        public users: {[id: string]: UserPublic},
        public games: {[id: string]: GamePublic}
    ) {}
}
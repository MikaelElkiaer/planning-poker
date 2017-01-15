import * as Model from '../model';
import * as Dto from '../../shared/dto';

export class Mapper {

    public static mapUserToPublic(user: Model.User) {
        return new Dto.UserPublic(user.pid, user.userName, user.active);
    }

    public static mapUsersToPublic(users: { [id: string]: Model.User }): { [id: string]: Dto.UserPublic } {
        var usersPublic = {};
        Object.keys(users).forEach(id => {
            var userPublic = this.mapUserToPublic(users[id]);
            usersPublic[userPublic.pid] = userPublic;
        });
        return usersPublic;
    }

    public static mapPlayerToPublic(player: Model.Player, hideCard: boolean): Dto.PlayerPublic {
        return new Dto.PlayerPublic(this.mapUserToPublic(player.user), this.getVisibleCard(player.currentCard, hideCard));
    }

    public static mapPlayersToPublic(players: { [id: string]: Model.Player }, hideCard: boolean): { [id: string]: Dto.PlayerPublic } {
        var playersPublic = {};
        Object.keys(players).forEach(id => {
            var playerPublic = this.mapPlayerToPublic(players[id], hideCard);
            playersPublic[playerPublic.user.pid] = playerPublic;
        });
        return playersPublic;
    }

    public static mapGameToPublic(game: Model.Game, hideCards: boolean): Dto.GamePublic {
        return new Dto.GamePublic(
            game.id,
            game.state,
            game.host.user.pid,
            Object.keys(game.players).reduce((prev, cur) => {
                prev[cur] = new Dto.PlayerPublic(this.mapUserToPublic(game.players[cur].user), this.getVisibleCard(game.players[cur].currentCard, hideCards));
                return prev
            }, {})
        );
    }

    private static getVisibleCard(card: Dto.PokerCard, hideCard: boolean): Dto.PokerCard {
        return (card !== Dto.PokerCard.NotPicked && hideCard) ? Dto.PokerCard.Picked : card;
    }
}
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

    public static mapPlayerToPublic(player: Model.Player, hideCard: boolean, requestingUser: Dto.UserPublic = null): Dto.PlayerPublic {
        return new Dto.PlayerPublic(this.mapUserToPublic(player.user), this.getVisibleCard(player, hideCard, requestingUser));
    }

    public static mapPlayersToPublic(players: { [id: string]: Model.Player }, hideCard: boolean, requestingUser: Dto.UserPublic = null): { [id: string]: Dto.PlayerPublic } {
        var playersPublic = {};
        Object.keys(players).forEach(id => {
            var playerPublic = this.mapPlayerToPublic(players[id], hideCard, requestingUser);
            playersPublic[playerPublic.user.pid] = playerPublic;
        });
        return playersPublic;
    }

    public static mapGameToPublic(game: Model.Game, hideCards: boolean, requestingUser: Dto.UserPublic = null): Dto.GamePublic {
        return new Dto.GamePublic(
            game.id,
            game.state,
            game.host.user.pid,
            Object.keys(game.players).reduce((prev, cur) => {
                prev[cur] = new Dto.PlayerPublic(this.mapUserToPublic(game.players[cur].user), this.getVisibleCard(game.players[cur], hideCards, requestingUser));
                return prev
            }, {}),
            game.config
        );
    }

    public static mapGamesToPublic(games: { [id: string]: Model.Game }, hideCards: boolean, requestingUser: Dto.UserPublic = null): { [id: string]: Dto.GamePublic} {
        let gamesPublic = {};
        Object.keys(games).forEach(id => {
            let gamePublic = this.mapGameToPublic(games[id], hideCards, requestingUser);
            gamesPublic[gamePublic.gameId] = gamePublic;
        });
        return gamesPublic;
    }

    private static getVisibleCard(player: Dto.PlayerPublic, hideCard: boolean, requestingUser: Dto.UserPublic = null): Dto.PokerCard {
        return (hideCard && player.currentCard !== Dto.PokerCard.NotPicked && (requestingUser === null || requestingUser.pid !== player.user.pid)) ? Dto.PokerCard.Picked : player.currentCard;
    }
}
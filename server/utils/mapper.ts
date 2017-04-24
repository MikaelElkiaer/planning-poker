import * as Model from '../model';
import * as Dto from '../../shared/dto';

export class Mapper {

    public static mapUserToPublic(user: Model.User) {
        return new Dto.User(user.pid, user.userName, user.active);
    }

    public static mapUsersToPublic(users: { [id: string]: Model.User }): { [id: string]: Dto.User } {
        var usersPublic = {};
        Object.keys(users).forEach(id => {
            var userPublic = this.mapUserToPublic(users[id]);
            usersPublic[userPublic.pid] = userPublic;
        });
        return usersPublic;
    }

    public static mapPlayerToPublic(player: Model.Player, hideCard: boolean, requestingUser: Dto.User = null): Dto.Player {
        return new Dto.Player(this.mapUserToPublic(player.user), this.getVisibleCard(player, hideCard, requestingUser));
    }

    public static mapPlayersToPublic(players: { [id: string]: Model.Player }, hideCard: boolean, requestingUser: Dto.User = null): { [id: string]: Dto.Player } {
        var playersPublic = {};
        Object.keys(players).forEach(id => {
            var playerPublic = this.mapPlayerToPublic(players[id], hideCard, requestingUser);
            playersPublic[playerPublic.user.pid] = playerPublic;
        });
        return playersPublic;
    }

    public static mapGameToPublic(game: Model.Game, hideCards: boolean, requestingUser: Dto.User = null): Dto.Game {
        return new Dto.Game(
            game.id,
            game.state,
            game.host.user.pid,
            Object.keys(game.players).reduce((prev, cur) => {
                prev[cur] = new Dto.Player(this.mapUserToPublic(game.players[cur].user), this.getVisibleCard(game.players[cur], hideCards, requestingUser));
                return prev
            }, {}),
            game.config
        );
    }

    public static mapGamesToPublic(games: { [id: string]: Model.Game }, hideCards: boolean, requestingUser: Dto.User = null): { [id: string]: Dto.Game} {
        let gamesPublic = {};
        Object.keys(games).forEach(id => {
            let gamePublic = this.mapGameToPublic(games[id], hideCards, requestingUser);
            gamesPublic[gamePublic.gameId] = gamePublic;
        });
        return gamesPublic;
    }

    private static getVisibleCard(player: Dto.Player, hideCard: boolean, requestingUser: Dto.User = null): Dto.PokerCard {
        return (hideCard && player.currentCard !== Dto.PokerCard.NotPicked && (requestingUser === null || requestingUser.pid !== player.user.pid)) ? Dto.PokerCard.Picked : player.currentCard;
    }
}
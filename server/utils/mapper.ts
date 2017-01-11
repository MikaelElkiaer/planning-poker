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

    public static mapPlayerToPublic(player: Model.Player, isVoting: boolean): Dto.PlayerPublic {
        return new Dto.PlayerPublic(this.mapUserToPublic(player.user), (player.currentCard !== Dto.PokerCard.NotPicked && isVoting) ? Dto.PokerCard.Picked : player.currentCard);
    }

    public static mapPlayersToPublic(players: { [id: string]: Model.Player }, isVoting: boolean): { [id: string]: Dto.PlayerPublic } {
        var playersPublic = {};
        Object.keys(players).forEach(id => {
            var playerPublic = this.mapPlayerToPublic(players[id], isVoting);
            playersPublic[playerPublic.user.pid] = playerPublic;
        });
        return playersPublic;
    }

    public static mapGameToPublic(game: Model.Game): Dto.GamePublic {
        return new Dto.GamePublic(
            game.id,
            game.state,
            game.host.user.pid,
            Object.keys(game.players).reduce((prev, cur) => {
                prev[cur] = new Dto.PlayerPublic(this.mapUserToPublic(game.players[cur].user), game.players[cur].currentCard);
                return prev
            }, {})
        );
    }
}
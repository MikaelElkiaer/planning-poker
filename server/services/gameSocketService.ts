import { injectable } from 'inversify';

import * as Msg from '../../shared/message';
import { User } from '../model';
import { IGameEvents, ILobbyEvents } from "../../shared/interfaces";
import { IEventService, IRequestService, IRoomService } from "../interfaces";
import { GameRepository } from '../repositories';
import { SocketService, UserSocketService } from '../services';
import { GameService, UserService } from "../abstracts";
import { GameConfig, GameState, Game, PokerCard } from '../../shared/dto';
import { Mapper } from '../utils/mapper';

@injectable()
export class GameSocketService extends GameService {
    private readonly user: User;

    constructor(events: IEventService, private requests: IRequestService, private rooms: IRoomService, private userService: UserService, 
    private games: GameRepository, private gameEvents: IGameEvents, private lobbyEvents: ILobbyEvents) {
        super(events);
        this.user = userService.user;
    }

    createGame(request: Msg.IGameRequest<void>): Msg.IResponse<string> {
        try {
            var game = this.games.addGame(this.user);
            this.lobbyEvents.onCreateGame({ data: Mapper.mapGameToPublic(game, game.isVoting) });
            return { data: game.id };
        } catch (error) {
            throw error;
        }
    }

    joinGame(request: Msg.IGameRequest<boolean>): Msg.IResponse<Game> {
        var game = this.games.getGameById(request.gameId);
        if (!game) {
            throw (`Game doesn\'t exist with id: ${request.gameId}`);
        }
        this.rooms.join(request.gameId);

        if (!request.data) {
            if (!game.getPlayerByPid(this.user.pid)) {
                game.addPlayer(this.user);
                let mappedPlayer = Mapper.mapPlayerToPublic(game.getPlayerByPid(this.user.pid), game.isVoting);
                this.gameEvents.onJoinGame({ data: mappedPlayer, gameId: game.id });
                this.lobbyEvents.onJoinGame({ gameId: game.id, playerId: mappedPlayer.user.pid });
            }
        }
        else {
            if (game.host.user.sid === this.user.sid)
                throw `A host cannot spectate his own game`;

            var player = game.getPlayerByPid(this.user.pid);
            if (player) {
                game.removePlayer(this.user.pid);
                this.gameEvents.onLeaveGame({ gameId: game.id, playerId: player.user.pid });
                this.lobbyEvents.onLeaveGame({ gameId: game.id, playerId: player.user.pid });
            }
        }

        return { data: Mapper.mapGameToPublic(game, game.isVoting, this.user) };
    }

    changeGameState(request: Msg.IGameRequest<GameState>): Msg.IResponse<GameState> {
        var game = this.games.getGameById(request.gameId);

        if (game.host.user.sid !== this.user.sid) {
            throw 'Only host can change game state';
        }

        game.state = request.data;

        if (game.isVoting)
            game.resetCards();

        this.gameEvents.onChangeGameState({ gameId: game.id, data: game.state });

        return { data: game.state };
    }

    chooseCard(request: Msg.IGameRequest<PokerCard>): Msg.IResponse<PokerCard> {
        var game = this.games.getGameById(request.gameId);

        if (!game.isVoting) {
            throw 'Cards can only be chosen in voting state';
        }

        var player = game.getPlayerByPid(this.user.pid);
        player.currentCard = request.data;

        this.gameEvents.onChooseCard({ gameId: game.id, playerId: player.user.pid, data: player.currentCard });

        if (game.config.autoEnd && game.allPlayersPicked()) {
            game.state = GameState.Waiting;
            this.gameEvents.onChangeGameState({ gameId: game.id, data: game.state });
        }

        return { data: player.currentCard };
    }

    leaveGame(request: Msg.IGameRequest<void>): Msg.IResponse<void> {
        var game = this.games.getGameById(request.gameId);
        var player = game.getPlayerByPid(this.user.pid);

        if (player.user === game.host.user) {
            Object.keys(game.players).forEach(pid => {
                let playerToBeKicked = game.getPlayerByPid(pid);
                this.gameEvents.onKickPlayer({ gameId: game.id, playerId: player.user.pid });
                this.lobbyEvents.onLeaveGame({ gameId: game.id, playerId: player.user.pid });
            });
            this.rooms.leave(game.id);
            this.games.removeGame(game.id);
            this.lobbyEvents.onHostQuitGame({ gameId: game.id });
        }
        else {
            this.rooms.leave(game.id);
            game.removePlayer(this.user.pid);

            this.gameEvents.onLeaveGame({ gameId: game.id, playerId: player.user.pid });
            this.lobbyEvents.onLeaveGame({ gameId: game.id, playerId: player.user.pid });
        }

        return { data: null };
    }

    kickPlayer(request: Msg.IGameRequest<string>): Msg.IResponse<void> {
        var game = this.games.getGameById(request.gameId);

        if (game.host.user.sid !== this.user.sid) {
            throw 'Only host can change game state';
        }

        var playerToBeKicked = game.getPlayerByPid(request.data);
        game.removePlayer(request.data);

        this.gameEvents.onKickPlayer({ gameId: game.id, playerId: playerToBeKicked.user.pid });
        this.lobbyEvents.onLeaveGame({ gameId: game.id, playerId: playerToBeKicked.user.pid });

        return { data: null };
    }
    
    changeGameConfig(request: Msg.IGameRequest<GameConfig>): Msg.IResponse<GameConfig> {
        var game = this.games.getGameById(request.gameId);

        if (game.host.user.sid !== this.user.sid) {
            throw 'Only host can change game state';
        }

        game.config = request.data;

        this.gameEvents.onChangeGameConfig({ gameId: game.id, data: game.config });

        return { data: game.config };
    }
}
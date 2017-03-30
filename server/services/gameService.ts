import { injectable } from 'inversify';

import { User } from '../model';
import { GameRepository } from '../repositories';
import { SocketService, UserService } from '../services';
import * as Dto from '../../shared/dto';
import { Mapper } from '../utils/mapper';
import { CLIENT_EVENTS as C } from '../../shared/events/clientEvents';
import { SERVER_EVENTS as S } from '../../shared/events/serverEvents';

@injectable()
export class GameService {
    private readonly user: User;

    constructor(private socketService: SocketService, private userService: UserService, private games: GameRepository) {
        this.user = userService.user;
        this.initialize();
    }

    private initialize() {
        this.socketService.on<null, Dto.GamePublic>(S.createGame, request => {
            try {
                var game = this.games.addGame(this.user);
                this.socketService.emitAllExceptSender(C.game.create, Mapper.mapGameToPublic(game, game.isVoting));
                return Mapper.mapGameToPublic(game, false, this.user);
            } catch (error) {
                throw error;
            }
        });

        this.socketService.on<Dto.JoinGame, Dto.GamePublic>(S.joinGame, request => {
            var game = this.games.getGameById(request.data.gameId);
            if (!game) {
                throw (`Game doesn\'t exist with id: ${request.data.gameId}`);
            }
            this.socketService.join(request.data.gameId);

            if (!request.data.spectate) {
                if (!game.getPlayerByPid(this.user.pid)) {
                    game.addPlayer(this.user);
                    this.socketService.emitAllExceptSender(C.game.stateChange, Mapper.mapGameToPublic(game, true));
                    this.socketService.emitAllInRoomExceptSender(C.user.joinGame, Mapper.mapPlayerToPublic(game.getPlayerByPid(this.user.pid), game.isVoting), game.id);
                }
            }
            else {
                if (game.host.user.sid === this.user.sid)
                    throw `A host cannot spectate his own game`;

                var player = game.getPlayerByPid(this.user.pid);
                if (player) {
                    game.removePlayer(this.user.pid);
                    this.socketService.emitAllInRoomExceptSender(C.user.leaveGame, Mapper.mapPlayerToPublic(player, game.isVoting), game.id);
                }
            }

            return Mapper.mapGameToPublic(game, game.isVoting, this.user);
        });

        this.socketService.on<Dto.ChangeGameState, null>(S.changeGameState, request => {
            var game = this.games.getGameById(request.data.gameId);

            if (game.host.user.sid !== this.user.sid) {
                throw 'Only host can change game state';
            }

            game.state = request.data.gameState;

            if (game.isVoting)
                game.resetCards();

            this.socketService.emitAllInRoom(C.host.changeGameState, Mapper.mapGameToPublic(game, game.isVoting), game.id);

            return null;
        });

        this.socketService.on<Dto.ChooseCard, null>(S.chooseCard, request => {
            var game = this.games.getGameById(request.data.gameId);

            if (!game.isVoting) {
                throw 'Cards can only be chosen in voting state';
            }

            var player = game.getPlayerByPid(this.user.pid);
            player.currentCard = request.data.newCard;

            this.socketService.emitAllInRoomExceptSender(C.user.chooseCard, Mapper.mapPlayerToPublic(player, true), game.id);

            return null;
        });

        this.socketService.on<Dto.LeaveGame, null>(S.leaveGame, request => {
            var game = this.games.getGameById(request.data.gameId);
            var player = game.getPlayerByPid(this.user.pid);

            if (player.user === game.host.user) {
                Object.keys(game.players).forEach(pid => {
                    let playerToBeKicked = game.getPlayerByPid(pid);
                    this.socketService.emitAllInRoomExceptSender(C.user.leaveGame, Mapper.mapPlayerToPublic(playerToBeKicked, game.isVoting, this.user), game.id);
                });
                this.socketService.leave(game.id);
                this.games.removeGame(game.id);
                this.socketService.emitAllExceptSender(C.game.hostQuit, Mapper.mapGameToPublic(game, true));
            }
            else {
                this.socketService.leave(game.id);
                game.removePlayer(this.user.pid);

                this.socketService.emitAllExceptSender(C.game.stateChange, Mapper.mapGameToPublic(game, true));
                this.socketService.emitAllInRoomExceptSender(C.user.leaveGame, Mapper.mapPlayerToPublic(player, game.isVoting), game.id);

                return null;
            }
        });

        this.socketService.on<Dto.KickPlayer, null>(S.kickPlayer, request => {
            var game = this.games.getGameById(request.data.gameId);
            
            if (game.host.user.sid !== this.user.sid) {
                throw 'Only host can change game state';
            }

            var playerToBeKicked = game.getPlayerByPid(request.data.pid);
            game.removePlayer(request.data.pid);
            
            this.socketService.emitAllInRoomExceptSender(C.user.leaveGame, Mapper.mapPlayerToPublic(playerToBeKicked, game.isVoting, this.user), game.id);

            return null;
        });
    }
}
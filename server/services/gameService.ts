import { injectable } from 'inversify';

import { User } from '../model';
import { GameRepository } from '../repositories';
import { SocketService, UserService } from '../services';
import * as Dto from '../../shared/dto';
import { Mapper } from '../utils/mapper';

@injectable()
export class GameService {
    private readonly user: User;

    constructor(private socketService: SocketService, private userService: UserService, private games: GameRepository) {
        this.user = userService.user;
        this.initialize();
    }

    private initialize() {
        this.socketService.on<null, Dto.GamePublic>('create-game', request => {
            try {
                var game = this.games.addGame(this.user);
                return Mapper.mapGameToPublic(game, false);
            } catch (error) {
                throw error;
            }
        });

        this.socketService.on<Dto.JoinGame, Dto.GamePublic>('join-game', request => {
            var game = this.games.getGameById(request.data.gameId);
            if (!game) {
                throw (`Game doesn\'t exist with id: ${request.data.gameId}`);
            }
            this.socketService.join(request.data.gameId);

            if (!request.data.spectate) {
                if (!game.getPlayerByPid(this.user.pid)) {
                    game.addPlayer(this.user);
                    this.socketService.emitAllExceptSender('game:state-change', Mapper.mapGameToPublic(game, true));
                    this.socketService.emitAllInRoomExceptSender('user:join-game', Mapper.mapPlayerToPublic(game.getPlayerByPid(this.user.pid), game.isVoting), game.id);
                }
            }
            else {
                if (game.host.user.sid === this.user.sid)
                    throw `A host cannot spectate his own game`;

                var player = game.getPlayerByPid(this.user.pid);
                if (player) {
                    game.removePlayer(this.user.pid);
                    this.socketService.emitAllInRoomExceptSender('user:leave-game', Mapper.mapPlayerToPublic(player, game.isVoting), game.id);
                }
            }

            return Mapper.mapGameToPublic(game, game.isVoting);
        });

        this.socketService.on<Dto.ChangeGameState, null>('change-game-state', request => {
            var game = this.games.getGameById(request.data.gameId);

            if (game.host.user.sid !== this.user.sid) {
                throw 'Only host can change game state';
            }

            game.state = request.data.gameState;

            if (game.isVoting)
                game.resetCards();

            this.socketService.emitAllInRoom('host:change-game-state', Mapper.mapGameToPublic(game, game.isVoting), game.id);

            return null;
        });

        this.socketService.on<Dto.ChooseCard, null>('choose-card', request => {
            var game = this.games.getGameById(request.data.gameId);

            if (!game.isVoting) {
                throw 'Cards can only be chosen in voting state';
            }

            var player = game.getPlayerByPid(this.user.pid);
            player.currentCard = request.data.newCard;

            this.socketService.emitAllInRoomExceptSender('user:choose-card', Mapper.mapPlayerToPublic(player, true), game.id);

            return null;
        });

        this.socketService.on<Dto.LeaveGame, null>('leave-game', request => {
            var game = this.games.getGameById(request.data.gameId);
            var player = game.getPlayerByPid(this.user.pid);

            this.socketService.leave(game.id);
            game.removePlayer(this.user.pid);

            this.socketService.emitAllExceptSender('game:state-change', Mapper.mapGameToPublic(game, true));
            this.socketService.emitAllInRoomExceptSender('user:leave-game', Mapper.mapPlayerToPublic(player, game.isVoting), game.id);

            return null;
        });

        this.socketService.on<Dto.KickPlayer, null>('kick-player', request => {
            var game = this.games.getGameById(request.data.gameId);
            
            if (game.host.user.sid !== this.user.sid) {
                throw 'Only host can change game state';
            }

            var playerToBeKicked = game.getPlayerByPid(request.data.pid);
            game.removePlayer(request.data.pid);
            
            this.socketService.emitAllInRoomExceptSender('user:leave-game', Mapper.mapPlayerToPublic(playerToBeKicked, game.isVoting), game.id);

            return null;
        });
    }
}
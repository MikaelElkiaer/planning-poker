import { GameCollection, User } from '../model';
import { SocketService, UserService } from '../services';
import * as Dto from '../../shared/dto';
import { Mapper } from '../utils/mapper';

export class GameService {
    private readonly user: User;

    constructor(private socketService: SocketService, private userService: UserService, private games: GameCollection) {
        this.user = userService.user;
        this.initialize();
    }

    private initialize() {
        this.socketService.on<null, Dto.GamePublic>('create-game', request => {
            try {
                var game = this.games.addGame(this.user);
                return Mapper.mapGameToPublic(game);
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

            var hideCards = game.state === Dto.GameState.Voting;

            if (!request.data.spectate) {
                if (!game.getPlayerByPid(this.user.pid)) {
                    game.addPlayer(this.user);
                    this.socketService.emitAllInRoomExceptSender('user:join-game', Mapper.mapPlayerToPublic(game.getPlayerByPid(this.user.pid), hideCards), game.id);
                }
            }
            else {
                if (game.host.user.sid === this.user.sid)
                    throw `A host cannot spectate his own game`;

                var player = game.getPlayerByPid(this.user.pid);
                if (player) {
                    game.removePlayer(this.user.pid);
                    this.socketService.emitAllInRoomExceptSender('user:leave-game', Mapper.mapPlayerToPublic(player, hideCards), game.id);
                }
            }

            return Mapper.mapGameToPublic(game, hideCards);
        });

        this.socketService.on<Dto.ChangeGameState, null>('change-game-state', request => {
            var game = this.games.getGameById(request.data.gameId);

            if (game.host.user.sid !== this.user.sid) {
                throw 'Only host can change game state';
            }

            game.state = request.data.gameState;

            if (game.state === Dto.GameState.Voting)
                game.resetCards();

            this.socketService.emitAllInRoom('host:change-game-state', Mapper.mapGameToPublic(game), game.id);

            return null;
        });

        this.socketService.on<Dto.ChooseCard, null>('choose-card', request => {
            var game = this.games.getGameById(request.data.gameId);

            if (game.state !== Dto.GameState.Voting) {
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

            var hideCards = game.state === Dto.GameState.Voting;

            this.socketService.emitAllInRoomExceptSender('user:leave-game', Mapper.mapPlayerToPublic(player, hideCards), game.id);

            return null;
        });

        this.socketService.on<Dto.KickPlayer, null>('kick-player', request => {
            var game = this.games.getGameById(request.data.gameId);
            
            if (game.host.user.sid !== this.user.sid) {
                throw 'Only host can change game state';
            }

            var playerToBeKicked = game.getPlayerByPid(request.data.pid);
            game.removePlayer(request.data.pid);
            
            var hideCards = game.state === Dto.GameState.Voting;
            this.socketService.emitAllInRoomExceptSender('user:leave-game', Mapper.mapPlayerToPublic(playerToBeKicked, hideCards), game.id);

            return null;
        });
    }
}
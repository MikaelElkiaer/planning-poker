import { SocketService } from "./";
import { IGameEvents } from "../../shared/interfaces/gameEvents";
import * as Msg from '../../shared/message';
import * as Dto from '../../shared/dto';
import { CLIENT_EVENTS as C } from '../../shared/events/clientEvents';

export class SocketGameEvents implements IGameEvents {
    constructor(private socketService: SocketService) { }

    onJoinGame(event: Msg.IGameEvent<Dto.Player>): void {
        this.socketService.emitAllInRoom(C.user.joinGame, event, event.gameId);
    }
    onChangeGameState(event: Msg.IGameEvent<Dto.GameState>): void {
        this.socketService.emitAllInRoom(C.game.stateChange, event, event.gameId);
    }
    onChooseCard(event: Msg.IGamePlayerEvent<Dto.PokerCard>): void {
        this.socketService.emitAllInRoom(C.user.chooseCard, event, event.gameId);
    }
    onLeaveGame(event: Msg.IGamePlayerEvent<void>): void {
        this.socketService.emitAll(C.user.leaveGame, event);
    }
    onKickPlayer(event: Msg.IGamePlayerEvent<void>): void {
        this.socketService.emitAll(C.user.leaveGame, event);
    }
    onChangeGameConfig(event: Msg.IGameEvent<Dto.GameConfig>): void {
        this.socketService.emitAllInRoom(C.host.changeGameConfig, event, event.gameId);
    }

}
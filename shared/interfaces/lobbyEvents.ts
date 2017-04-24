import * as Dto from '../dto';
import * as Msg from '../message';

export interface ILobbyEvents {
    onJoinGame(event: Msg.IGamePlayerEvent<void>): void;
    onLeaveGame(event: Msg.IGamePlayerEvent<Dto.Player>): void;
    onCreateGame(event: Msg.IEvent<Dto.Game>): void;
    onHostQuitGame(event: Msg.IGameEvent<void>): void;
}
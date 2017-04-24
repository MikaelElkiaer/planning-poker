import * as Dto from '../dto';
import * as Msg from '../message';

export interface IGameEvents {
    onJoinGame(event: Msg.IGameEvent<Dto.Player>): void;
    onChangeGameState(event: Msg.IGameEvent<Dto.GameState>): void;
    onChooseCard(event: Msg.IGamePlayerEvent<Dto.PokerCard>): void;
    onLeaveGame(event: Msg.IGamePlayerEvent<void>): void;
    onKickPlayer(event: Msg.IGamePlayerEvent<void>): void;
    onChangeGameConfig(event: Msg.IGameEvent<Dto.GameConfig>): void;
}
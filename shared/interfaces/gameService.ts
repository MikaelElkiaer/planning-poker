import * as Msg from '../message';
import * as Dto from '../dto';

export interface IGameService {
    createGame(request: Msg.IGameRequest<void>): Msg.IResponse<string>;

    joinGame(request: Msg.IGameRequest<boolean>): Msg.IResponse<Dto.Game>;

    changeGameState(request: Msg.IGameRequest<Dto.GameState>): Msg.IResponse<Dto.GameState>;

    chooseCard(request: Msg.IGameRequest<Dto.PokerCard>): Msg.IResponse<Dto.PokerCard>;

    leaveGame(request: Msg.IGameRequest<void>): Msg.IResponse<void>;

    kickPlayer(request: Msg.IGameRequest<string>): Msg.IResponse<void>;

    changeGameConfig(request: Msg.IGameRequest<Dto.GameConfig>): Msg.IResponse<Dto.GameConfig>;
}
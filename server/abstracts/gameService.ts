import * as Dto from '../../shared/dto';
import * as Msg from '../../shared/message';
import { IGameService } from "../../shared/interfaces";
import { SERVER_EVENTS as S } from '../../shared/events/serverEvents';
import { IEventService } from "../interfaces";

export abstract class GameService implements IGameService {
    constructor(protected events: IEventService) {
        this.initialize();
    }

    private initialize() {
        this.events.on(S.createGame, this.createGame);
        this.events.on(S.joinGame, this.joinGame);
        this.events.on(S.changeGameState, this.changeGameState);
        this.events.on(S.chooseCard, this.chooseCard);
        this.events.on(S.leaveGame, this.leaveGame);
        this.events.on(S.kickPlayer, this.kickPlayer);
        this.events.on(S.changeGameConfig, this.changeGameConfig);
    }

    abstract createGame(request: Msg.IGameRequest<void>): Msg.IResponse<string>;

    abstract joinGame(request: Msg.IGameRequest<boolean>): Msg.IResponse<Dto.Game>;

    abstract changeGameState(request: Msg.IGameRequest<Dto.GameState>): Msg.IResponse<Dto.GameState>;

    abstract chooseCard(request: Msg.IGameRequest<Dto.PokerCard>): Msg.IResponse<Dto.PokerCard>;

    abstract leaveGame(request: Msg.IGameRequest<void>): Msg.IResponse<void>;

    abstract kickPlayer(request: Msg.IGameRequest<string>): Msg.IResponse<void>;

    abstract changeGameConfig(request: Msg.IGameRequest<Dto.GameConfig>): Msg.IResponse<Dto.GameConfig>;
}
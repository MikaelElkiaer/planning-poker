import * as Dto from '../../shared/dto';
import * as Msg from '../../shared/message';
import { IUserService } from "../../shared/interfaces";
import { User } from "../model";
import { IEventService } from "../interfaces";
import { CLIENT_EVENTS as C } from '../../shared/events/clientEvents';
import { SERVER_EVENTS as S } from '../../shared/events/serverEvents';

export abstract class UserService implements IUserService {

    constructor(public user: User, protected events: IEventService) {
        this.initializeEvents();
    }

    private initializeEvents() {
        this.events.on(S.conn, this.connect);
        this.events.on(S.home, this.getLobby);
        this.events.on(S.changeUserName, this.changeUserName);
    }

    abstract connect(): Msg.IResponse<Dto.UserConnect>;
    abstract getLobby(): Msg.IResponse<Dto.Lobby>;
    abstract changeUserName(request: Msg.IRequest<string>): Msg.IResponse<string>;
}
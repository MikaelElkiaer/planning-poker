import * as Dto from '../dto';
import * as Msg from '../message';

export interface IUserService {
    connect(): Msg.IResponse<Dto.UserConnect>;
    getLobby(): Msg.IResponse<Dto.Lobby>;
    changeUserName(request: Msg.IRequest<string>): Msg.IResponse<string>; 
}
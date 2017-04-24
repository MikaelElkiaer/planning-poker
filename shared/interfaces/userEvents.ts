import * as Dto from '../dto';
import * as Msg from '../message';

export interface IUserEvents {
    onUserConnect(event: Msg.IEvent<Dto.User>): void;
    onUserDisconnect(event: Msg.IEvent<Dto.User>): void;
    onUserChangeName(event: Msg.IUserEvent<string>): void;
}
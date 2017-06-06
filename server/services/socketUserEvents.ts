import { SocketService } from './';
import { IUserEvents } from "../../shared/interfaces/userEvents";
import * as Msg from "../../shared/message";
import * as Dto from '../../shared/dto'
import { CLIENT_EVENTS as C } from '../../shared/events/clientEvents';

export class SocketUserEvents implements IUserEvents {
    constructor(private socketService: SocketService) { }

    onUserConnect(event: Msg.IEvent<Dto.User>): void {
        this.socketService.emitAll(C.user.connect, event);
    }

    onUserDisconnect(event: Msg.IEvent<Dto.User>): void {
        this.socketService.emitAll(C.user.disconnect, event);
    }

    onUserChangeName(event: Msg.IUserEvent<string>): void {
        this.socketService.emitAll(C.user.changeUserName, event);
    }
}
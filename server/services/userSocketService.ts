import { injectable } from 'inversify';
import 'reflect-metadata';

import { User } from '../model';
import { GameRepository, UserRepository } from '../repositories';
import { SocketService } from '../services';
import { UserService } from '../abstracts';
import { Mapper } from '../utils/mapper';
import * as Dto from '../../shared/dto';
import * as Msg from '../../shared/message';
import { IUserEvents } from "../../shared/interfaces";
import { IEventService } from "../interfaces";

@injectable()
export class UserSocketService extends UserService {
    constructor(private socketService: SocketService, private users: UserRepository, private games: GameRepository, events: IEventService, private userEvents: IUserEvents) {
        super(users.getUserById(socketService.socketId), events);

        this.userEvents.onUserConnect({ data: Mapper.mapUserToPublic(this.user) });

        this.socketService.on<null, null>('disconnect', () => {
            this.user.active = false;
            this.userEvents.onUserDisconnect({ data: Mapper.mapUserToPublic(this.user) });
            return null;
        });
    }

    connect(): Msg.IResponse<Dto.UserConnect> {
        return { data: new Dto.UserConnect(this.user.pid, this.user.sid, this.user.userName) };
    }

    getLobby(): Msg.IResponse<Dto.Lobby> {
        let users = Mapper.mapUsersToPublic(this.users.getAll());
        let games = Mapper.mapGamesToPublic(this.games.games, true);

        return { data: new Dto.Lobby(users, games) };
    }
    
    changeUserName(request: Msg.IRequest<string>): Msg.IResponse<string> {
        var oldUsername = this.user.userName;
        var newUsername = request.data;

        if (User.isValidUserName(newUsername, this.getUserNameList())) {
            this.user.userName = newUsername;

            this.userEvents.onUserChangeName({ playerId: this.user.pid, data: this.user.userName });

            return { data: newUsername };
        }
        else
            throw `The new username ${newUsername} is not allowed.`;
    }

    static handleNewSocket(socket: SocketIO.Socket, next: (error?: any) => void, users: UserRepository) {
        var sid = socket.handshake.query.userSid;
        var userName = socket.handshake.query.userName;

        if (!sid || !users.getUserBySid(sid))
            users.addUser(socket.id, new User(userName));
        else
            users.changeId(sid, socket.id, true);

        next();
    }

    private getUserNameList(): string[] {
        var allUsers = this.users.getAll();
        return Object.keys(allUsers).map(id => allUsers[id].userName);
    }
}
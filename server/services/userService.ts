import { injectable } from 'inversify';
import 'reflect-metadata';

import { User } from '../model';
import { GameRepository, UserRepository } from '../repositories';
import { SocketService } from '../services';
import { Mapper } from '../utils/mapper';
import * as Dto from '../../shared/dto';

@injectable()
export class UserService {
    public readonly user: User;

    constructor(private socketService: SocketService, private users: UserRepository, private games: GameRepository) {
        this.user = users.getUserById(socketService.socketId);
        this.initialize();
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

    private initialize() {
        this.socketService.emitAllExceptSender('user:connect', Mapper.mapUserToPublic(this.user));

        this.socketService.on<null, Dto.UserConnect>('conn', () => {
            return new Dto.UserConnect(this.user.pid, this.user.sid, this.user.userName);
        });

        this.socketService.on<null, null>('disconnect', () => {
            this.user.active = false;
            this.socketService.emitAllExceptSender('user:disconnect', Mapper.mapUserToPublic(this.user));
            return null;
        });

        this.socketService.on<null, Dto.Home>('home', request => {
            let users = Mapper.mapUsersToPublic(this.users.getAll());
            let games = Mapper.mapGamesToPublic(this.games.games, true);

            return new Dto.Home(users, games);
        });

        this.socketService.on<string, string>('change-username', request => {
            var oldUsername = this.user.userName;
            var newUsername = request.data;

            if (User.isValidUserName(newUsername, this.getUserNameList())) {
                this.user.userName = newUsername;

                this.socketService.emitAll<Dto.UserPublic>('user:change-username', Mapper.mapUserToPublic(this.user));

                return newUsername;
            }
            else
                throw `The new username ${newUsername} is not allowed.`;
        });
    }

    private getUserNameList(): string[] {
        var allUsers = this.users.getAll();
        return Object.keys(allUsers).map(id => allUsers[id].userName);
    }
}
import { User, UserCollection } from '../model';
import { SocketService } from '../services';
import { Mapper } from '../utils/mapper';
import * as Dto from '../../shared/dto';

export class UserService {
    public readonly user: User;

    constructor(private socketService: SocketService, private users: UserCollection) {
        this.user = users.getUserById(socketService.socketId);
        this.initialize();
    }

    static handleNewSocket(socket: SocketIO.Socket, next: (error?: any) => void, users: UserCollection) {
        var sid = socket.handshake.query.userSid;

        if (!sid || !users.getUserBySid(sid))
            users.addUser(socket.id, new User());
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

        this.socketService.on<null, { [id: string]: Dto.UserPublic }>('home', request => {
            return Mapper.mapUsersToPublic(this.users.getAll());
        });

        this.socketService.on<string, string>('change-username', request => {
            var oldUsername = this.user.userName;
            var newUsername = request.data;

            if (User.isValidUserName(newUsername, this.users)) {
                this.user.userName = newUsername;

                this.socketService.emitAll<Dto.UserPublic>('user:change-username', Mapper.mapUserToPublic(this.user));

                return newUsername;
            }
            else
                throw `The new username ${newUsername} is not allowed.`;
        });
    }
}
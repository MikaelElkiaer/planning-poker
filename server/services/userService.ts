import { User, UserCollection } from '../model';
import { SocketService } from '../services';
import { Mapper } from '../utils/mapper';
import * as Dto from '../../shared/dto';

export class UserService {
    constructor(private io: SocketIO.Server, private socket: SocketIO.Socket, private socketService: SocketService,
        private users: UserCollection) {
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
        this.socketService.emitAllExceptSender('user:connect', Mapper.mapUserToPublic(this.users.getUserById(this.socket.id)));

        this.socketService.on<null, Dto.UserConnect>('conn', () => {
            var user = this.users.getUserById(this.socket.id);
            return new Dto.UserConnect(user.pid, user.sid, user.userName);
        });

        this.socketService.on<null, null>('disconnect', () => {
            var user = this.users.getUserById(this.socket.id);
            user.active = false;
            this.socketService.emitAllExceptSender('user:disconnect', Mapper.mapUserToPublic(user));
            return null;
        });

        this.socketService.on<null, { [id: string]: Dto.UserPublic }>('home', request => {
            return Mapper.mapUsersToPublic(this.users.getAll());
        });

        this.socketService.on<string, string>('change-username', request => {
            var user = this.users.getUserById(this.socket.id);
            var oldUsername = user.userName;
            var newUsername = request.data;

            if (User.isValidUserName(newUsername, this.users)) {
                user.userName = newUsername;

                this.socketService.emitAll<Dto.UserPublic>('user:change-username', Mapper.mapUserToPublic(user));

                return newUsername;
            }
            else
                throw `The new username ${newUsername} is not allowed.`;
        });
    }
}
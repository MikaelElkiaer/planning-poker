import { injectable } from 'inversify';
import 'reflect-metadata';

import * as Msg from '../../shared/message';
import { User } from '../model'

@injectable()
export class SocketService {
    public readonly socketId: string;

    constructor(
        private io: SocketIO.Server,
        private socket: SocketIO.Socket
    ) {
        this.socketId = socket.id;
    }

    emitAll<T>(eventName: string, data: T) {
        var response: Msg.IEmitResponse<T> = { data };
        this.io.emit(eventName, response);
    }

    emitAllExceptSender<T>(eventName: string, data: T) {
        this.socket.broadcast.emit(eventName, { data });
    }

    emitAllInRoom<T>(eventName: string, data: T, roomId: string) {
        this.io.in(roomId).emit(eventName, { data });
    }

    emitAllInRoomExceptSender<T>(eventName: string, data: T, roomId: string) {
        this.socket.broadcast.to(roomId).emit(eventName, { data });
    }

    on<T,S>(eventName: string, cb: (request: Msg.IEmitRequest<T>) => S) {
        this.socket.on(eventName, (data, callback) => {
            if (callback) {
                try {
                    callback({ data: cb(data) });
                } catch (error) {
                    callback({ data: null, error });
                }
            }
            else {
                cb(data);
            }
        });
    }

    join(roomId: string) {
        this.socket.join(roomId);
    }

    leave(roomId: string) {
        this.socket.leave(roomId);
    }
}
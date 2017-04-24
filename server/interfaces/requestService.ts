export interface IRequestService {
    emitAll<T>(eventName: string, data: T);
    emitAllExceptSender<T>(eventName: string, data: T);
    emitAllInRoom<T>(eventName: string, data: T, roomId: string);
    emitAllInRoomExceptSender<T>(eventName: string, data: T, roomId: string);
}
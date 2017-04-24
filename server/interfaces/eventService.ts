import * as Msg from '../../shared/message';

export interface IEventService {
    on<T,S>(eventName: string, callback: (request: Msg.IRequest<T>) => Msg.IResponse<S>);
}
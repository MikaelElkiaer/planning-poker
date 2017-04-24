import { IGameEvent } from "./gameEvent";
import { IUserEvent } from "./userEvent";

export interface IGamePlayerEvent<T> extends IGameEvent<T>, IUserEvent<T> {
    
}
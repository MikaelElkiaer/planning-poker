import { IEvent } from "./event";

export interface IUserEvent<T> extends IEvent<T> {
    playerId: string;
}
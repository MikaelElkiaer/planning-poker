import { IEvent } from "./event";

export interface IGameEvent<T> extends IEvent<T> {
    gameId: string;
}
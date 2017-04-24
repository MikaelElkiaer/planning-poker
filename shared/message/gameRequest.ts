import { IRequest } from "./request";

export interface IGameRequest<T> extends IRequest<T> {
    gameId: string;
}
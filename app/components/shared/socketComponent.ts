import { Component, OnDestroy, OnInit } from '@angular/core';

import { SocketEvent, SocketService, SocketState } from '../../services/socket.service';
import * as Msg from '../../../shared/message';

export abstract class SocketComponent implements OnDestroy, OnInit {
    protected socketState: SocketState = SocketState.Disconnected;
    private events: SocketEvent[] = [];
    private socketStateSubscription = undefined;

    constructor(
        private readonly socket: SocketService
    ) {}

    ngOnInit(): void {
        this.onStateChange(this.socket.state);
        this.socketStateSubscription = this.socket.socketStateEventEmitter.subscribe(socketState => this.onStateChange(socketState));
    }

    ngOnDestroy(): void {
        if (this.socketStateSubscription) {
            this.socketStateSubscription.unsubscribe();
        }

        this.socket.removeListeners(this.events);
        this.events = [];
    }

    private onStateChange(newSocketState: SocketState) {
        this.handleStateChange(newSocketState);
        this.socketState = newSocketState;
    }

    protected abstract handleStateChange(state: SocketState);

    protected emit<T, S>(eventName: string, request: Msg.IEmitRequest<T>): Promise<S> {
        return this.socket.emit<T, S>(eventName, request);
    }

    protected async on<T>(eventName: string, callback: (arg: Msg.IOnResponse<T>) => void) {
        this.events.push(new SocketEvent(eventName, callback));
        this.socket.on<T>(eventName, callback);
    }
}
import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import { Container } from "inversify";

import { TYPES } from './types';
import { GameRepository, UserRepository } from './repositories';
import { GameSocketService, SocketService, UserSocketService } from './services';
import { Server } from'./server';


var app = express();
var server = http.createServer(this.app);
var io = socketio(this.server);

var serverContainer = new Container();

serverContainer.bind<express.Express>(TYPES.Express).toConstantValue(express());
serverContainer.bind<http.Server>(TYPES.Server).toConstantValue(http.createServer(serverContainer.get<express.Express>(TYPES.Express)));
serverContainer.bind<SocketIO.Server>(TYPES.IO).toConstantValue(socketio(serverContainer.get<http.Server>(TYPES.Server)));

serverContainer.bind<GameRepository>(GameRepository).toSelf().inSingletonScope();
serverContainer.bind<UserRepository>(UserRepository).toSelf().inSingletonScope();

serverContainer.bind<Server>(Server).toSelf().inSingletonScope();

export { serverContainer };
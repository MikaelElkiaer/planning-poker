import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import * as compression from 'compression';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { TYPES } from './types';
import { Game, User, Player } from './model';
import { GameRepository, UserRepository } from './repositories';
import { GameSocketService, UserSocketService, SocketService } from './services';
import * as Dto from '../shared/dto';

@injectable()
export class Server {
  constructor(
    @inject(TYPES.Express) private readonly app: express.Express,
    @inject(TYPES.Server) private readonly server: http.Server,
    @inject(TYPES.IO) private readonly io: SocketIO.Server,
    private readonly games: GameRepository,
    private readonly users: UserRepository
  ) { }

  setUpAndStart() {
    this.setUpWebServer();
    this.setUpNewConnectionHandler();
    this.setUpServices();
    this.startServer();
  }

  private setUpWebServer() {
    this.app.disable('view cache');
    this.app.set('port', (process.env.PORT || 5000));
    this.app.set('view engine', 'pug');
    this.app.use(compression());
    this.app.use('/app', express.static('app'));
    this.app.use('/shared', express.static('shared'));
    this.app.use('/node_modules', express.static('node_modules'));
    this.app.get('/views/:name', (req, res) => { res.render(`${__dirname}/../app/views/${req.params.name}`); });
    this.app.get(['/', '/game/:id'], (req, res) => { res.render(`${__dirname}/../app/index`); });
  }

  private setUpNewConnectionHandler() {
    this.io.use((socket, next) => {
      UserSocketService.handleNewSocket(socket, next, this.users);
    });
  }

  private setUpServices() {
    this.io.on('connection', socket => {
      var socketService = new SocketService(this.io, socket);

      var userService = new UserSocketService(socketService, this.users, this.games);
      var gameService = new GameSocketService(socketService, userService, this.games);
    });
  }

  private startServer() {
    this.server.listen(this.app.get('port'), () => console.log(`listening on *:${this.app.get('port')}`));
  }
}
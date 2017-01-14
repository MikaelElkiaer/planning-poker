import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

import { Game, GameCollection, User, UserCollection, Player } from './model';
import { GameService, UserService, SocketService } from './services';
import * as Dto from '../shared/dto';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set up server and routes
app.disable('view cache');
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug');
app.use('/app', express.static('app'));
app.use('/shared', express.static('shared'));
app.use('/node_modules', express.static('node_modules'));
app.get('/views/:name', (req, res) => { res.render(`${__dirname}/../app/views/${req.params.name}`); });
app.get(['/', '/game/:id'], (req, res) => { res.render(`${__dirname}/../app/index`); });

// Initialize state
var games = new GameCollection();
var users = new UserCollection();

// Set handler for new sockets
io.use((socket, next) => {
  UserService.handleNewSocket(socket, next, users);
});

// Initialize services
io.on('connection', socket => {
  var socketService = new SocketService(io, socket);
  
  var userService = new UserService(socketService, users);
  var gameService = new GameService(socketService, userService, games);
});

// start server
server.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));
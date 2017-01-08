import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

import { Game, GameCollection, User, UserCollection, Player } from './model';
import { SocketService } from './services/socketService';
import * as DTO from '../DTO';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Setup of server and routes
app.disable('view cache');
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug');
app.use('/app', express.static('app'));
app.use('/DTO', express.static('DTO'));
app.use('/node_modules', express.static('node_modules'));
app.get('/views/:name', (req, res) => { res.render(`${__dirname}/../app/views/${req.params.name}`); });
app.get(['/', '/game/:id'], (req, res) => { res.render(`${__dirname}/../app/index`); });

var rooms = new GameCollection();
var users = new UserCollection();


// create new user if needed, otherwise change id for existing user
io.use((socket, next) => {
  var sid = socket.handshake.query.userSid;

  if (!sid || !users.getUserBySid(sid))
    users.addUser(socket.id, new User());
  else
    users.changeId(sid, socket.id, true);

  next();
});

// fire up socket handlers
io.on('connection', socket => {
  var socketService = new SocketService(io, socket);
  
  socketService.emitAllExceptSender('user:connect', mapUserToPublic(users.getUserById(socket.id)));

  socketService.on<null, DTO.UserConnect>('conn', () => {
    var user = users.getUserById(socket.id);
    return new DTO.UserConnect(user.pid, user.sid, user.userName);
  });

  socketService.on<null, null>('disconnect', () => {
    var user = users.getUserById(socket.id);
    user.active = false;
    socketService.emitAllExceptSender('user:disconnect', mapUserToPublic(user));
    return null;
  });

  socketService.on<null, {[id: string]: DTO.UserPublic}>('home', data => {
    return mapUsersToPublic(users.getAll());
  });

  socket.on('change-username', (newUsername, callback) => {
    var user = users.getUserById(socket.id);
    var oldUsername = user.userName;
    var newUsername = newUsername;

    if (User.isValidUserName(newUsername, users)) {
      user.userName = newUsername;

      callback(null, newUsername);

      io.emit('user:change-username', mapUserToPublic(user));
    }
    else
      callback(`The new username ${newUsername} is not allowed.`);
  });

  socket.on('create-game', (data, callback) => {
    var user = users.getUserById(socket.id);

    try {
      var room = rooms.addRoom(user);
      callback(null, user.pid);
    } catch (error) {
      callback(error);
    }
  });

  socket.on('join-game', (data, callback) => {
    var room = rooms.getRoomById(data.gameId);
    if (!room) {
      callback(`Room with doesn\'t exist with id: ${data.gameId}`);
      return;
    }
    socket.join(data.gameId);

    if (!data.spectate) {
      var user = users.getUserById(socket.id);

      if (!room.getUserByPid(user.pid)) {
        room.addUser(user);
      }
    }

    var hideCards = room.state === DTO.GameState.Voting;

    callback(null, { players: mapPlayersToPublic(room.getAll(), hideCards), hostPid: room.host.user.pid, gameState: room.state });

    if (!data.spectate)
      socket.broadcast.to(room.id).emit('user:join-game', mapPlayerToPublic(room.getUserByPid(user.pid), hideCards));
  });

  socket.on('change-game-state', (data, callback) => {
    var user = users.getUserById(socket.id);
    var room = rooms.getRoomById(data.gameId);

    if (room.host.user.sid !== user.sid) {
      callback('Only host can change game state');
      return;
    }

    room.state = data.gameState;

    if (room.state === DTO.GameState.Voting)
      room.resetCards();

    var result = { gameState: room.state, players: mapPlayersToPublic(room.getAll(), false) };

    callback(null, result);

    socket.broadcast.to(room.id).emit('host:change-game-state', result);
  });

  socket.on('choose-card', (data, callback) => {
    var user = users.getUserById(socket.id);
    var room = rooms.getRoomById(data.gameId);

    if (room.state !== DTO.GameState.Voting) {
      callback('Cards can only be chosen in voting state')
      return;
    }

    var roomUser = room.getUserByPid(user.pid);
    roomUser.currentCard = data.newCard;

    callback();

    socket.broadcast.to(room.id).emit('user:choose-card', mapPlayerToPublic(roomUser, true));
  });
});

// start server
server.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));

function mapUserToPublic(user: User) {
  return new DTO.UserPublic(user.pid, user.userName, user.active);
}

function mapUsersToPublic(users: { [id: string]: User }): { [id: string]: DTO.UserPublic } {
  var usersPublic = {};
  Object.keys(users).forEach(id => {
    var userPublic = mapUserToPublic(users[id]);
    usersPublic[userPublic.pid] = userPublic;
  });
  return usersPublic;
}

function mapPlayerToPublic(player: Player, isVoting: boolean): DTO.PlayerPublic {
  return new DTO.PlayerPublic(player.user, (player.currentCard !== DTO.PokerCard.NotPicked && isVoting) ? DTO.PokerCard.Picked : player.currentCard);
}

function mapPlayersToPublic(players: { [id: string]: Player }, isVoting: boolean): { [id: string]: DTO.PlayerPublic } {
  var playersPublic = {};
  Object.keys(players).forEach(id => {
    var playerPublic = mapPlayerToPublic(players[id], isVoting);
    playersPublic[playerPublic.user.pid] = playerPublic;
  });
  return playersPublic;
}

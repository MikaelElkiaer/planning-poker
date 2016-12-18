var express = require('express');
var app = express();
var http = require('http').Server(app);
var io: SocketIO.Namespace = require('socket.io')(http);

import { Game, GameCollection, User, UserCollection, Player } from './model';
import * as DTO from '../DTO';

// Setup of server and routes
app.disable('view cache');
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug');  
app.use('/app', express.static('app'));
app.use('/node_modules', express.static('node_modules'));
app.get('/views/:name', (req, res) => { res.render(`${__dirname}/../app/views/${req.params.name}`); });
app.get('*', (req, res) => { res.render(`${__dirname}/../app/index`); });

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
  socket.broadcast.emit('user:connect', mapUserToPublic(users.getUserById(socket.id)));

  socket.on('conn', (data, callback: (user: DTO.UserConnect) => void) => {
    var user = users.getUserById(socket.id);
    callback({
      sid: user.sid,
      pid: user.pid,
      userName: user.userName
    });
  });

  socket.on('disconnect', () => {
    var user = users.getUserById(socket.id);
    user.active = false;
    socket.broadcast.emit('user:disconnect', mapUserToPublic(user));
  });
  
  socket.on('home', (data, callback: (data?: any, error?: string) => any) => {
    callback(mapUsersToPublic(users.getAll()));
  });

  socket.on('change-username', (data, callback) => {
    var user = users.getUserById(socket.id);
    var oldUsername = user.userName;
    var newUsername = data.newUsername;

    if (User.isValidUserName(newUsername, users)) {
      user.userName = newUsername;

      callback(null, { newUsername });

      io.emit('user:change-username', {
        pid: user.pid,
        username: newUsername
      });
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

    var user = users.getUserById(socket.id);

    if (!room.getUserByPid(user.pid)) {
      room.addUser(user);
    }

    callback(null, mapPlayersToPublic(room.getAll()));

    socket.broadcast.to(data.gameId).emit('user:join-game', mapPlayerToPublic(room.getUserByPid(user.pid)));
  });
});

// start server
http.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));

function mapUserToPublic(user: User) {
  var userPublic = new DTO.UserPublic();
  userPublic.pid = user.pid;
  userPublic.userName = user.userName;
  return userPublic;
}

function mapUsersToPublic(users: { [id: string]: User }): { [id: string]: DTO.UserPublic } {
  var usersPublic = {};
  Object.keys(users).forEach(id => {
    var user = users[id];
    var userPublic = new DTO.UserPublic();
    userPublic.pid = user.pid;
    userPublic.userName = user.userName;
    usersPublic[userPublic.pid] = userPublic;
  });
  return usersPublic;
}

function mapPlayerToPublic(player: Player): DTO.PlayerPublic {
  var playerPublic = new DTO.PlayerPublic();
  playerPublic.user = mapUserToPublic(player.user);
  playerPublic.currentCard = player.currentCard;
  return playerPublic;
}

function mapPlayersToPublic(players: { [id: string]: Player }): { [id: string]: DTO.PlayerPublic } {
  var playersPublic = {};
  Object.keys(players).forEach(id => {
    var player = players[id];
    var playerPublic = new DTO.PlayerPublic();
    playerPublic.user = mapUserToPublic(player.user);
    playerPublic.currentCard = player.currentCard;
    playersPublic[playerPublic.user.pid] = playerPublic;
  });
  return playersPublic;
}

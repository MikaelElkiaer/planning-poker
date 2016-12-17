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
  
  if (!sid || !users.GetUserBySid(sid))
    users.AddUser(socket.id, new User());
  else
    users.ChangeId(sid, socket.id, true);
  
  next();
});

// fire up socket handlers
io.on('connection', socket => {
  socket.broadcast.emit('user:connect', mapUserToPublic(users.GetUserById(socket.id)));

  socket.on('conn', (data, callback: (user: DTO.UserConnect) => void) => {
    var user = users.GetUserById(socket.id);
    callback({
      Sid: user.Sid,
      Pid: user.Pid,
      UserName: user.UserName
    });
  });

  socket.on('disconnect', () => {
    var user = users.GetUserById(socket.id);
    user.Active = false;
    socket.broadcast.emit('user:disconnect', mapUserToPublic(user));
  });
  
  socket.on('home', (data, callback: (data?: any, error?: string) => any) => {
    callback(mapUsersToPublic(users.GetAll()));
  });

  socket.on('change-username', (data, callback) => {
    var user = users.GetUserById(socket.id);
    var oldUsername = user.UserName;
    var newUsername = data.newUsername;

    if (User.IsValidUserName(newUsername, users)) {
      user.UserName = newUsername;

      callback(null, { newUsername });

      io.emit('user:change-username', {
        pid: user.Pid,
        username: newUsername
      });
    }
    else
      callback(`The new username ${newUsername} is not allowed.`);
  });

  socket.on('create-game', (data, callback) => {
    var user = users.GetUserById(socket.id);

    try {
      var room = rooms.AddRoom(user);
      callback(null, user.Pid);
    } catch (error) {
      callback(error);
    }
  });

  socket.on('join-game', (data, callback) => {
    var room = rooms.GetRoomById(data.gameId);
    if (!room) {
      callback('Room with doesn\'t exist with id: %s', data.gameId);
      return;
    }
    socket.join(data.gameId);

    var user = users.GetUserById(socket.id);

    if (!room.GetUserByPid(user.Pid)) {
      room.AddUser(user);
    }

    callback(null, mapPlayersToPublic(room.GetAll()));

    socket.broadcast.to(data.gameId).emit('user:join', mapPlayerToPublic(room.GetUserByPid(user.Pid)));
  });
});

// start server
http.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));

function mapUserToPublic(user: User) {
  var userPublic = new DTO.UserPublic();
  userPublic.Pid = user.Pid;
  userPublic.UserName = user.UserName;
  return userPublic;
}

function mapUsersToPublic(users: { [id: string]: User }): { [id: string]: DTO.UserPublic } {
  var usersPublic = {};
  Object.keys(users).forEach(id => {
    var user = users[id];
    var userPublic = new DTO.UserPublic();
    userPublic.Pid = user.Pid;
    userPublic.UserName = user.UserName;
    usersPublic[userPublic.Pid] = userPublic;
  });
  return usersPublic;
}

function mapPlayerToPublic(player: Player): DTO.PlayerPublic {
  var playerPublic = new DTO.PlayerPublic();
  playerPublic.User = mapUserToPublic(player.User);
  playerPublic.CurrentCard = player.CurrentCard;
  return playerPublic;
}

function mapPlayersToPublic(players: { [id: string]: Player }): { [id: string]: DTO.PlayerPublic } {
  var playersPublic = {};
  Object.keys(players).forEach(id => {
    var player = players[id];
    var playerPublic = new DTO.PlayerPublic();
    playerPublic.User = mapUserToPublic(player.User);
    playerPublic.CurrentCard = player.CurrentCard;
    playersPublic[playerPublic.User.Pid] = playerPublic;
  });
  return playersPublic;
}

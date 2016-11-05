var express = require('express');
var app = express();
var http = require('http').Server(app);
var io: SocketIO.Namespace = require('socket.io')(http);

import { User, UserCollection } from './app/model/user';
import { RoomCollection } from './app/model/room';

import * as DTO from './app/model/DTO';

// Setup of server and routes
app.disable('view cache');
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug');  
app.use('/app', express.static('app'));
app.use('/node_modules', express.static('node_modules'));
app.get('/', (req, res) => { res.render(`${__dirname}/app/index`); });
app.get('/views/:name', (req, res) => { res.render(`${__dirname}/app/views/${req.params.name}`); });

var rooms = new RoomCollection();
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
  socket.broadcast.emit('user:connect', users.getUserById(socket.id).public);

  socket.on('conn', (data, callback: (user: DTO.UserConnect) => void) => {
    var user = users.getUserById(socket.id);
    callback({
      Sid: user.sid,
      Pid: user.pid,
      UserName: user.username
    });
  });

  socket.on('disconnect', () => {
    var user = users.getUserById(socket.id);
    user.active = false;
    socket.broadcast.emit('user:disconnect', user.public);
  });
  
  socket.on('home', (data, callback: (data?: any, error?: string) => any) => {
    callback({ users: users.getAll() });
  });

  socket.on('change-username', (data, callback) => {
    var user = users.getUserById(socket.id);
    var oldUsername = user.username;
    var newUsername = data.newUsername;

    if (User.isValidUsername(newUsername, users)) {
      user.username = newUsername;

      callback(null, { newUsername });

      io.emit('user:change-username', {
        pid: user.pid,
        username: newUsername
      });
    }
    else
      callback(`The new username ${newUsername} is not allowed.`);
  });
});

// start server
http.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));

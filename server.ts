var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

import { User, UserCollection } from './app/model/user';
import { RoomCollection } from './app/model/room';

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
  
});

// start server
http.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));

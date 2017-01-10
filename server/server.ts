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

var games = new GameCollection();
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

  socketService.on<null, {[id: string]: DTO.UserPublic}>('home', request => {
    return mapUsersToPublic(users.getAll());
  });

  socketService.on<string,string>('change-username', request => {
    var user = users.getUserById(socket.id);
    var oldUsername = user.userName;
    var newUsername = request.data;

    if (User.isValidUserName(newUsername, users)) {
      user.userName = newUsername;
      
      socketService.emitAll<DTO.UserPublic>('user:change-username', mapUserToPublic(user));

      return newUsername;
    }
    else
      throw `The new username ${newUsername} is not allowed.`;
  });

  socketService.on<null, DTO.GamePublic>('create-game', request => {
    var user = users.getUserById(socket.id);
    
    try {
      var game = games.addGame(user);
      return mapGameToPublic(game);
    } catch (error) {
      throw error;
    }
  });

  socketService.on<DTO.JoinGame, DTO.GamePublic>('join-game', request => {
    var game = games.getGameById(request.data.gameId);
    if (!game) {
      throw (`Game doesn\'t exist with id: ${request.data.gameId}`);
    }
    socketService.join(request.data.gameId);
    
    var hideCards = game.state === DTO.GameState.Voting;

    if (!request.data.spectate) {
      var user = users.getUserById(socket.id);

      if (!game.getUserByPid(user.pid)) {
        game.addUser(user);
      }
      
      socketService.emitAllInRoomExceptSender('user:join-game', mapPlayerToPublic(game.getUserByPid(user.pid), hideCards), game.id);
    }

    return mapGameToPublic(game);
  });

  socketService.on<DTO.ChangeGameState, null>('change-game-state', request => {
    var user = users.getUserById(socket.id);
    var room = games.getGameById(request.data.gameId);

    if (room.host.user.sid !== user.sid) {
      throw 'Only host can change game state';
    }

    room.state = request.data.gameState;

    if (room.state === DTO.GameState.Voting)
      room.resetCards();

    socketService.emitAllInRoom('host:change-game-state', mapGameToPublic(room), room.id);

    return null;
  });

  socketService.on<DTO.ChooseCard,null>('choose-card', request => {
    var user = users.getUserById(socket.id);
    var room = games.getGameById(request.data.gameId);

    if (room.state !== DTO.GameState.Voting) {
      throw 'Cards can only be chosen in voting state';
    }

    var roomUser = room.getUserByPid(user.pid);
    roomUser.currentCard = request.data.newCard;

    socketService.emitAllInRoomExceptSender('user:choose-card', mapPlayerToPublic(roomUser, true), room.id);

    return null;
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

function mapGameToPublic(game: Game): DTO.GamePublic {
  return new DTO.GamePublic(
    game.id,
    game.state,
    game.host.user.pid,
    Object.keys(game.users).reduce((prev, cur) => {
      prev[cur] = new DTO.PlayerPublic(mapUserToPublic(game.users[cur].user), game.users[cur].currentCard);
      return prev
    }, {})
  );
}

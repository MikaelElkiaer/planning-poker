import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

import { Game, GameCollection, User, UserCollection, Player } from './model';
import { SocketService } from './services/socketService';
import * as Dto from '../DTO';

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

  socketService.on<null, Dto.UserConnect>('conn', () => {
    var user = users.getUserById(socket.id);
    return new Dto.UserConnect(user.pid, user.sid, user.userName);
  });

  socketService.on<null, null>('disconnect', () => {
    var user = users.getUserById(socket.id);
    user.active = false;
    socketService.emitAllExceptSender('user:disconnect', mapUserToPublic(user));
    return null;
  });

  socketService.on<null, {[id: string]: Dto.UserPublic}>('home', request => {
    return mapUsersToPublic(users.getAll());
  });

  socketService.on<string,string>('change-username', request => {
    var user = users.getUserById(socket.id);
    var oldUsername = user.userName;
    var newUsername = request.data;

    if (User.isValidUserName(newUsername, users)) {
      user.userName = newUsername;
      
      socketService.emitAll<Dto.UserPublic>('user:change-username', mapUserToPublic(user));

      return newUsername;
    }
    else
      throw `The new username ${newUsername} is not allowed.`;
  });

  socketService.on<null, Dto.GamePublic>('create-game', request => {
    var user = users.getUserById(socket.id);
    
    try {
      var game = games.addGame(user);
      return mapGameToPublic(game);
    } catch (error) {
      throw error;
    }
  });

  socketService.on<Dto.JoinGame, Dto.GamePublic>('join-game', request => {
    var game = games.getGameById(request.data.gameId);
    if (!game) {
      throw (`Game doesn\'t exist with id: ${request.data.gameId}`);
    }
    socketService.join(request.data.gameId);
    
    var hideCards = game.state === Dto.GameState.Voting;

    if (!request.data.spectate) {
      var user = users.getUserById(socket.id);

      if (!game.getPlayerByPid(user.pid)) {
        game.addPlayer(user);
      }
      
      socketService.emitAllInRoomExceptSender('user:join-game', mapPlayerToPublic(game.getPlayerByPid(user.pid), hideCards), game.id);
    }

    return mapGameToPublic(game);
  });

  socketService.on<Dto.ChangeGameState, null>('change-game-state', request => {
    var user = users.getUserById(socket.id);
    var game = games.getGameById(request.data.gameId);

    if (game.host.user.sid !== user.sid) {
      throw 'Only host can change game state';
    }

    game.state = request.data.gameState;

    if (game.state === Dto.GameState.Voting)
      game.resetCards();

    socketService.emitAllInRoom('host:change-game-state', mapGameToPublic(game), game.id);

    return null;
  });

  socketService.on<Dto.ChooseCard,null>('choose-card', request => {
    var user = users.getUserById(socket.id);
    var game = games.getGameById(request.data.gameId);

    if (game.state !== Dto.GameState.Voting) {
      throw 'Cards can only be chosen in voting state';
    }

    var player = game.getPlayerByPid(user.pid);
    player.currentCard = request.data.newCard;

    socketService.emitAllInRoomExceptSender('user:choose-card', mapPlayerToPublic(player, true), game.id);

    return null;
  });
});

// start server
server.listen(app.get('port'), () => console.log(`listening on *:${app.get('port')}`));

function mapUserToPublic(user: User) {
  return new Dto.UserPublic(user.pid, user.userName, user.active);
}

function mapUsersToPublic(users: { [id: string]: User }): { [id: string]: Dto.UserPublic } {
  var usersPublic = {};
  Object.keys(users).forEach(id => {
    var userPublic = mapUserToPublic(users[id]);
    usersPublic[userPublic.pid] = userPublic;
  });
  return usersPublic;
}

function mapPlayerToPublic(player: Player, isVoting: boolean): Dto.PlayerPublic {
  return new Dto.PlayerPublic(player.user, (player.currentCard !== Dto.PokerCard.NotPicked && isVoting) ? Dto.PokerCard.Picked : player.currentCard);
}

function mapPlayersToPublic(players: { [id: string]: Player }, isVoting: boolean): { [id: string]: Dto.PlayerPublic } {
  var playersPublic = {};
  Object.keys(players).forEach(id => {
    var playerPublic = mapPlayerToPublic(players[id], isVoting);
    playersPublic[playerPublic.user.pid] = playerPublic;
  });
  return playersPublic;
}

function mapGameToPublic(game: Game): Dto.GamePublic {
  return new Dto.GamePublic(
    game.id,
    game.state,
    game.host.user.pid,
    Object.keys(game.players).reduce((prev, cur) => {
      prev[cur] = new Dto.PlayerPublic(mapUserToPublic(game.players[cur].user), game.players[cur].currentCard);
      return prev
    }, {})
  );
}

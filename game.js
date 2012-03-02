/// <reference path="views/public/_.js" />
var _q = require('./views/public/_.js');

var game = require('./views/public/game.js');

var game_rep_type = {
    name: '',
    player1: '',
    player2: '',
    gameObj: null,
    join: function (player) {
        if (!!this.player2)
            return false;
        this.player2 = player;
        this.gameObj = game.makeGame(this.name, 5, 5, this.player1, this.player2);
        return true;
    }
};

var games = {};

function makeAGame(name, playerid) {
    if (!!games[name]) return { succeed: false, error: "A game with the same id already exists" };
    games[name] = Object.create(game_rep_type, {
        'name': { value: name, enumerable: true, writable: false },
        'player1': { value: playerid, enumerable: true, writable: false },
        'player2': { value: null, enumerable: true, writable: true },
        'gameObj': { value: null, enumerable: false, writable: true }
    });
    return { succeed: true, game: games[name] };
};

function getAGame(name) {
    return games[name];
};

function getAvailableGames() {
    return _q.filter(_q.map(games, function (v, k) {
        return v;
    }), function (g) { return g.player2 == null;});
};

var io;

function configure(_io) {
    io = _io;
    io.disable('log');
    io.enable('browser client etag');

    var onASquareTaken = function (square, gameRep) {
        var data = { i: square.i, j: square.j, owner: square.owner, scores: gameRep.gameObj.playerScores };
        console.log('aSquareTaken: ', gameRep.name, data);
        io.sockets.in(gameRep.name).emit('aSquareTaken', data);
    };

    io.sockets.on('connection', function (socket) {
        socket.on('login', function (data, callback) {
            console.log("socket:login: ", data.username);
            socket['username'] = data.username;
            callback({ games: getAvailableGames() });
        });
        socket.on('makeAGame', function (data, callback) {
            console.log("socket:makeAGame: ", data);
            var res = makeAGame(data.gamename, socket['username']);
            if (res.succeed) {
                socket.join(data.gamename);
                socket['game'] = res.game;
                io.sockets.emit('newGameMade', { game: res.game });
            }
            callback(res);
        });
        socket.on('joinAGame', function (data, callback) {
            var g = getAGame(data.gamename);
            console.log("socket:joinAGame: ", data, g);
            if (g.join(socket['username'])) {
                //todo: register game event handlers
                socket['game'] = g;
                socket.join(data.gamename);
                var gdata = { player1: g.gameObj._player1, player2: g.gameObj._player2, size: g.gameObj.size, turn: g.gameObj.turn, scores: g.gameObj.playerScores };
                callback({ succeed: true, game: gdata });
                socket.broadcast.to(data.gamename).emit('playerJoined', { player: socket.username, game: gdata }); //broadcast the start of the game
                g.gameObj.events.tookASquare = function (square) { onASquareTaken(square, g); };
            }
            else
                callback({ succeed: false });
            });
        socket.on('takeALine', function (data, callback) {
            if (socket['game'].gameObj.turn != socket.username)
                callback({ succeed: false, error: "It's not your turn!" });
            else {
                var g = socket['game'].gameObj;
                var succeed = g.takeALine(data.i, data.j, data.dir);
                callback({ succeed: succeed, turn: g.turn });
                if (succeed)
                    socket.broadcast.to(data.gamename).emit('aLineTaken', { i: data.i, j: data.j, dir: data.dir,way: data.way, owner: socket.username, turn: g.turn }); //broadcast a line taken
            }
        });
    });
} 

exports.configure = configure;
exports.makeAGame = makeAGame;
exports.getAvailableGames = getAvailableGames;
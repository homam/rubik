/// <reference path="_.js" />

var _q = (typeof require != 'undefined') ? require('./_.js') : _;

var line_type = {
    i: 0,
    j: 0,
    dir: '',
    owner: null,
    toString: function () {
        return "Line: i:" + this.i + ", j:" + this.j + ", " + this.dir + ", " + this.owner;
    },
    getAdjacentSquarePositions: function () {
        return[('V' == this.dir ? { i: this.i - 1, j: this.j } : { i: this.i, j: this.j - 1 }), { i: this.i, j: this.j }];
    },
    getAdjacentPointPositions: function () {
        return[{ i: this.i, j: this.j }, ('V' == this.dir ? { i: this.i, j: this.j + 1 } : { i: this.i + 1, j: this.j })];
    }
};

var makeALine = function (i, j, dir, owner) {
    return Object.create(line_type, {
        'i': { value: i, enumerable: true, writable: false },
        'j': { value: j, enumerable: true, writable: false },
        'dir': { value: dir, enumerable: true, writable: false },
        'owner': { value: owner, enumerable: true, writable: true, configurable:true }
    });
};

var line_point_type = {
    V: null,
    H: null,
    toString: function () {
        return "Line Point:" + (!!this.H ? "\n\tH:" + this.H.toString() : "") + (!!this.V ? "\n\tV:" + this.V.toString() : "");
    }
}

var square_type = {
    i: 0,
    j: 0,
    owner: '',
    toString: function () {
        return "Square: " + this.i + ", " + this.j + ", " + this.owner;
    },
    getAdjacentLinePositions: function() {
        var i = this.i, j= this.j;
        return[{ i: i, j: j, dir: 'H' }, { i: i, j: j, dir: 'V' }, { i: i + 1, j: j, dir: 'V' }, { i: i, j: j + 1, dir: 'H' }];
    }
};

var makeASquare = function (i, j, owner) {
    return Object.create(square_type, {
        'i': { value: i, enumerable: true, writable: false },
        'j': { value: j, enumerable: true, writable: false },
        'owner': { value: owner, enumerable: true, writable: true, configurable: true }
    });
}

var game_type = {
    _player1: '',
    _player2: '',
    playerScores: {},
    turn: '',
    squares: [[]],
    getSqure: function (i, j) {
        return this.squares[i][j];
    },
    lines: [[]],
    getLine: function (i, j, dir) {
        if (i < 0 || i > this.size.i) throw 'i is out of range';
        if (j < 0 || j > this.size.j) throw 'j is out of range';
        var line = this.lines[i][j][dir];
        if (!line) throw 'i and j are out of range';
        return line;
    },
    size: { i: 0, j: 0 },
    _getAdjacentSquares: function (i, j, dir) {
        var line = this.getLine(i, j, dir);
        var self = this;
      
        return _q.filter(_q.map(line.getAdjacentSquarePositions(), function (pos) {
            return self.squares[pos.i] && self.squares[pos.i][pos.j] ? self.squares[pos.i][pos.j] : null;
        }), function (s) { return s != null; });
    },
    _getAdjacentLines: function (i, j) {
        var square = this.getSqure(i, j);
        var self = this;
        return _q.map(square.getAdjacentLinePositions(), function (pos) {
            return  self.lines[pos.i][pos.j][pos.dir];
        });
    },
    takeALine: function (i, j, dir) {
        var line = this.getLine(i, j, dir);
        if (!!line.owner) return false;
        line.owner = this.turn;
        this.events.tookALine(line);
        var self = this;
        var tookASquare = false;
        this._getAdjacentSquares(i, j, dir).forEach(function (square) {
            if (_q.all(self._getAdjacentLines(square.i, square.j), function (l) { return !!l.owner; })) {
                square.owner = self.turn;
                self.playerScores[self.turn]++;
                self.events.tookASquare(square);
                tookASquare = true;
            }
        });
        if (!tookASquare)
            this.turn = (this.turn == this._player1) ? this._player2 : this._player1;
        return true;
    },
    events: {
        tookALine: function (line){ },
        tookASquare: function (square) { console.log("event:default:tookASquare: ", square);}
    }
};

var makeGame = function (name, maxi, maxj, player1, player2) {
    return Object.create(game_type, {
        'name': { value: name, enumerable: true, writable: false },
        '_player1': { value: player1, enumerable: true, writable: false },
        '_player2': { value: player2, enumerable: true, writable: false },
        'playerScores': { value: (function () { var o = {}; o[player1] = 0; o[player2] = 0; return o; })(), enumerable: true, writable: false },
        'turn': { value: player1, enumerable: true, writable: true },
        'size': { value: { i: maxi, j: maxj }, enumerable: true, writable: false },
        'lines': {
            value: (function () {
                var lines = [];
                for (var i = 0; i <= maxi; i++) {
                    lines[i] = [];
                    for (var j = 0; j <= maxj; j++) {
                        lines[i][j] = Object.create(line_point_type, {});
                        ['H', 'V'].forEach(function (dir) {
                            if ('H' == dir && i == maxi) return;
                            if ('V' == dir && j == maxj) return;
                            var line = makeALine(i, j, dir, null);
                            Object.defineProperty(lines[i][j], dir, { value: line, enumerable: true, writable: false });
                        });
                    }
                }
                return lines;
            })(), enumerable: true, writable: false
        },
        'squares': {
            value: (function () {
                var squares = [];
                for (var i = 0; i < maxi; i++) {
                    squares[i] = [];
                    for (var j = 0; j < maxj; j++) {
                        squares[i][j] = makeASquare(i, j, null);
                    }
                }
                return squares;
            }()), enumerable: true, writable: false
        }
    });
};

if (typeof exports != 'undefined') {
    exports.makeGame = makeGame;
}
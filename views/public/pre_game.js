(function pre_game() {
    var states_type = { NotLoggeedIn: 1, LoggedIn: 2, WaitingForSomebodytoJoin: 3, StartedPlaying: 4 };
    var currentState = states_type.NotLoggeedIn;
    $(function () {
        $("#login form input[name='user_name']").focus();
        $("#login form").bind("submit", function () {
            var unameInput = $(this).find("input[name='user_name']");
            socket.emit('login', { username: unameInput.val() }, function (data) {
                console.log("callback:login: ", data);
                me = unameInput.val();
                updateGames(data.games);

                currentState = states_type.LoggedIn;
            });
            console.log(unameInput.val());
            $("#login").hide();
            $("#joinmake").show().find("input[name='game_name']").focus();
            return false;
        });

        $("#joinmake form").bind("submit", function () {
            var gnameInput = $(this).find("input[name='game_name']");
            socket.emit("makeAGame", { gamename: gnameInput.val() }, function (data) {
                console.log("callback:makeAGame: ", data);
                if (data.succeed) {
                    $("#joinmake").hide();
                    $("#waiting").show();
                    currentState = states_type.WaitingForSomebodytoJoin;
                }  else alert('Cannot make a game');
            });
            return false;
        });
    });

    function updateGames(newGames, oldGames) {
        if (!!oldGames) {
            $("#joinmake .available-games li").filter(function (el) {
                oldGames.forEach(function (g) {
                    $(el).attr("data-gamename") == g.gamename;
                });
            }).remove();
        }
        if (!!newGames) {
            newGames.forEach(function (g) {
                var li = $("<li><a href='javascript:void(0);'><span class='name'>" + g.name + "</span> <span class='by'>(" + g.player1 + ")</span></a></li>");
                (function (name) {
                    li.click(function () {
                        joinAGame(name);
                    });
                })(g.name);
                $("#joinmake .available-games").append(li);
            });
        }
    }

    var startTheGame = function (game) {
        $("#joinmake").hide();
        $("#waiting").hide();
        $("#game").show();
        gameUi.start(game);

    };

    function joinAGame(gamename) {
        socket.emit('joinAGame', { gamename: gamename }, function (data) {
            console.log("callback:joinAGame: ", data);
            if (data.succeed)
                startTheGame(data.game);
            else
                alert('Cannot join the game');
        });
    }

    socket.on('playerJoined', function (data) {
        console.log("socket:playerJoined: ", data);
        startTheGame(data.game);
    });

    socket.on('newGameMade', function (data) {
        updateGames([data.game], null);
    });
})();
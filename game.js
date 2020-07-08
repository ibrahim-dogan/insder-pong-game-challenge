(function () {
    var CSS, CONSTS;

    function initVariables() {
        CSS = {
            arena: {
                width: 900,
                height: 600,
                background: '#62247B',
                position: 'fixed',
                top: '50%',
                left: '50%',
                zIndex: '999',
                transform: 'translate(-50%, -50%)'
            },
            ball: {
                width: 15,
                height: 15,
                position: 'absolute',
                top: 0,
                left: 350,
                borderRadius: 50,
                background: '#C6A62F'
            },
            line: {
                width: 0,
                height: 600,
                borderLeft: '2px dashed #C6A62F',
                position: 'absolute',
                top: 0,
                left: '50%'
            },
            stick: {
                width: 12,
                height: 85,
                position: 'absolute',
                background: '#C6A62F',
                color: '#62247B',
                writingMode: 'vertical-rl',
                textAlign: 'center',
                fontSize: 10,
            },
            stick1: {
                left: 0,
                top: 150
            },
            stick2: {
                right: 0,
                top: 150
            },
            score: {
                position: 'absolute',
                color: '#C6A62F',
                fontSize: 64,
                fontFamily: 'monospace',
            },
            score1: {
                top: 0,
                left: '25%'
            },
            score2: {
                top: 0,
                right: '25%'
            },
            infoBar: {
                width: 900,
                height: 50,
                position: 'absolute',
                background: '#C6A62F',
                color: '#62247B',
                bottom: -60,
                left: 0,
                textAlign: 'center',
                lineHeight: '50px',
            }
        };
        CONSTS = {
            gameSpeed: 10,
            score1: 0,
            score2: 0,
            stick1Speed: 0,
            stick2Speed: 0,
            ballTopSpeed: 0,
            ballLeftSpeed: 0,
            cpu1Active: false,
            cpu2Active: false,
        };
    }

    function start() {
        document.body.innerHTML = '';
        initVariables();
        draw();
        setEvents();
        var saveGame = readLocalStorage();
        if (!saveGame)
            roll();
        loop();
    }

    function readLocalStorage() {
        var saveGame = localStorage.getItem("saveGame");
        if (saveGame) {
            saveGame = JSON.parse(saveGame);
            CONSTS = saveGame.CONSTS;
            CSS = saveGame.CSS;
            if (CONSTS.cpu1Active) cpuMode(1);
            if (CONSTS.cpu2Active) cpuMode(2);
            return true;
        }
        return false;

    }

    function draw() {
        $('<div/>', {id: 'pong-game'}).css(CSS.arena).appendTo('body');
        $('<div/>', {id: 'pong-line'}).css(CSS.line).appendTo('#pong-game');
        $('<div/>', {id: 'pong-ball'}).css(CSS.ball).appendTo('#pong-game');
        $('<div/>', {id: 'stick-1'}).css($.extend(CSS.stick1, CSS.stick)).text('PLAYER 1').appendTo('#pong-game');
        $('<div/>', {id: 'stick-2'}).css($.extend(CSS.stick2, CSS.stick)).text('PLAYER 2').appendTo('#pong-game');
        $('<div/>', {id: 'score-1'}).css($.extend(CSS.score1, CSS.score)).appendTo('#pong-game');
        $('<div/>', {id: 'score-2'}).css($.extend(CSS.score2, CSS.score)).appendTo('#pong-game');
        $('<div/>', {id: 'info-bar'}).css(CSS.infoBar).text("PLAYER 1: W S 🕹 PLAYER 2: UP DOWN️ 🕹 CPU 1: C CPU 2: V").appendTo('#pong-game');
    }

    function setEvents() {
        $(document).on('keydown', function (e) {
            if (e.keyCode == 83 && !CONSTS.cpu1Active) {
                CONSTS.stick1Speed = 5;
            }
            if (e.keyCode == 87 && !CONSTS.cpu1Active) {
                CONSTS.stick1Speed = -5;
            }
            if (e.keyCode == 40 && !CONSTS.cpu2Active) {
                CONSTS.stick2Speed = 5;
            }
            if (e.keyCode == 38 && !CONSTS.cpu2Active) {
                CONSTS.stick2Speed = -5;
            }
            if (e.keyCode == 67) {
                CONSTS.cpu1Active = !CONSTS.cpu1Active;
                cpuMode(1);
            }
            if (e.keyCode == 86) {
                CONSTS.cpu2Active = !CONSTS.cpu2Active;
                cpuMode(2);
            }
        });
    }

    function cpuMode(PLAYER) {
        switch (PLAYER) {
            case 1:
                clearInterval(window.cpu2);
                $('#stick-1').text("PLAYER 1");

                if (CONSTS.cpu1Active) {
                    $('#stick-1').text("CPU 1");
                    window.cpu2 = setInterval(function () {
                        if (CSS.ball.top > CSS.stick1.top) {
                            CONSTS.stick1Speed = 5;
                        } else {
                            CONSTS.stick1Speed = -5;
                        }
                    }, 200);
                }
                break;
            case 2:
                clearInterval(window.cpu1);
                $('#stick-2').text("PLAYER 2");

                if (CONSTS.cpu2Active) {
                    $('#stick-2').text("CPU 2");
                    window.cpu1 = setInterval(function () {
                        if (CSS.ball.top > CSS.stick2.top) {
                            CONSTS.stick2Speed = 5;
                        } else {
                            CONSTS.stick2Speed = -5;
                        }
                    }, 200);
                }
                break;

        }
    }


    function writeLocalStore() {
        var saveGame = {CONSTS: CONSTS, CSS: CSS};
        localStorage.setItem("saveGame", JSON.stringify(saveGame));
    }

    function loop() {
        window.pongLoop = setInterval(function () {
            renderScore();
            renderStick();
            renderBall();
            gameController();
            writeLocalStore();
        }, CONSTS.gameSpeed);
    }

    function gameController() {
        //BALL ON THE LEFT
        if (CSS.ball.left <= CSS.stick.width) {
            CSS.ball.top > CSS.stick1.top && CSS.ball.top < CSS.stick1.top + CSS.stick.height && (CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1)
            || playerLost(1);
        }

        //BALL ON THE RIGHT
        if (CSS.ball.left >= CSS.arena.width - CSS.ball.width - CSS.stick.width) {
            CSS.ball.top > CSS.stick2.top && CSS.ball.top < CSS.stick2.top + CSS.stick.height && (CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1)
            || playerLost(2);
        }

        if (CONSTS.score1 < 5 && CONSTS.score2 < 5) {
        } else {
            gameOver();
        }
    }

    function gameOver() {
        if (CONSTS.score1 === 5)
            alert($('#stick-1').text() + ' Wins');
        if (CONSTS.score2 === 5)
            alert($('#stick-1').text() + ' Wins');

        localStorage.clear();
        clearInterval(window.pongLoop);
        CONSTS.score1 = 0;
        CONSTS.score2 = 0;
        roll();
        loop();
    }

    function renderScore() {
        $('#score-1').text(CONSTS.score1);
        $('#score-2').text(CONSTS.score2);
    }

    function renderStick() {
        if (CSS.stick1.top + CONSTS.stick1Speed >= 0 && CSS.stick1.top + CONSTS.stick1Speed + (CSS.stick.height) <= 600)
            CSS.stick1.top += CONSTS.stick1Speed;
        if (CSS.stick2.top + CONSTS.stick2Speed >= 0 && CSS.stick2.top + CONSTS.stick2Speed + (CSS.stick.height) <= 600)
            CSS.stick2.top += CONSTS.stick2Speed;
        $('#stick-1').css('top', CSS.stick1.top);
        $('#stick-2').css('top', CSS.stick2.top);
    }

    function renderBall() {
        CSS.ball.top += CONSTS.ballTopSpeed;
        CSS.ball.left += CONSTS.ballLeftSpeed;

        if (CSS.ball.top <= 0 ||
            CSS.ball.top >= CSS.arena.height - CSS.ball.height) {
            CONSTS.ballTopSpeed = CONSTS.ballTopSpeed * -1;
        }

        $('#pong-ball').css({top: CSS.ball.top, left: CSS.ball.left});
    }


    function playerLost(PLAYER) {
        switch (PLAYER) {
            case 1:
                CONSTS.score2++;
                break;
            case 2:
                CONSTS.score1++;
                break;
        }
        roll();
    }

    function roll() {
        CSS.ball.top = 250;
        CSS.ball.left = 350;

        var side = -1;

        if (Math.random() < 0.5) {
            side = 1;
        }

        CONSTS.ballTopSpeed = Math.random() * -2 - 3;
        CONSTS.ballLeftSpeed = side * (Math.random() * 2 + 3);
    }

    start();
})();
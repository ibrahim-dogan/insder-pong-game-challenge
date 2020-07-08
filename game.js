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
                borderRadius: 50,
                background: '#C6A62F',
            },
            balls: [
                {
                    top: 0,
                    left: 350,
                },
            ],
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
            infoTopBar: {
                width: 900,
                height: 50,
                position: 'absolute',
                background: '#C6A62F',
                color: '#62247B',
                textAlign: 'center',
                lineHeight: '50px',
                top: -60,
                left: 0,
            },
            infoBottomBar: {
                width: 900,
                height: 50,
                position: 'absolute',
                background: '#C6A62F',
                color: '#62247B',
                textAlign: 'center',
                lineHeight: '50px',
                bottom: -60,
                left: 0,
            }
        };
        CONSTS = {
            gameSpeed: 20,
            score1: 0,
            score2: 0,
            stick1Speed: 0,
            stick2Speed: 0,
            balls: [
                {
                    ballTopSpeed: 0,
                    ballLeftSpeed: 0,
                }
            ],
            cpu1Active: false,
            cpu2Active: false,
            trailEffect: true,
        };
    }

    function start() {
        document.body.innerHTML = '';
        initVariables();
        var saveGame = readLocalStorage();
        if (!saveGame)
            roll();
        if (CONSTS.trailEffect)
            trailEffect();
        setEvents();
        draw();
        loop();
    }

    function readLocalStorage() {
        var saveGame = localStorage.getItem("saveGame-ibrahim");
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
        $('<div/>', {id: 'stick-1'}).css($.extend(CSS.stick1, CSS.stick)).text(CONSTS.cpu1Active ? 'CPU 1' : 'PLAYER 1').appendTo('#pong-game');
        $('<div/>', {id: 'stick-2'}).css($.extend(CSS.stick2, CSS.stick)).text(CONSTS.cpu2Active ? 'CPU 2' : 'PLAYER 2').appendTo('#pong-game');
        $('<div/>', {id: 'score-1'}).css($.extend(CSS.score1, CSS.score)).appendTo('#pong-game');
        $('<div/>', {id: 'score-2'}).css($.extend(CSS.score2, CSS.score)).appendTo('#pong-game');
        $('<div/>', {id: 'info-bottom-bar'}).css(CSS.infoBottomBar).text("NEW BALL: SPACE 🕹 REMOVE BALL: X 🕹 TRAIL EFFECT: T").appendTo('#pong-game');
        $('<div/>', {id: 'info-top-bar'}).css(CSS.infoTopBar).text("PLAYER 1: W S 🕹 PLAYER 2: UP DOWN️ 🕹 CPU 1: C 🕹 CPU 2: V").appendTo('#pong-game');

        CONSTS.balls.forEach(function (ball, i) {
            $('<div/>', {id: `pong-ball-${i}`}).css($.extend(CSS.ball, CSS.balls[i])).appendTo('#pong-game');
        });
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
            if (e.keyCode == 32) {
                addBall();
            }
            if (e.keyCode == 88) {
                removeBall();
            }
            if (e.keyCode == 84) {
                CONSTS.trailEffect = !CONSTS.trailEffect;
                trailEffect();
            }
        });
    }

    function cpuMode(PLAYER) {
        function nearestBallToPlayer(PLAYER) {
            var nearestBall = CSS.balls[0];
            CSS.balls.forEach(function (ball, i) {
                if (nearestBall.left > ball.left && PLAYER === 1) {
                    nearestBall = ball;
                } else if (nearestBall.left < ball.left && PLAYER === 2) {
                    nearestBall = ball;
                }
            });
            return nearestBall;
        }

        switch (PLAYER) {
            case 1:
                clearInterval(window.cpu2);
                $('#stick-1').text("PLAYER 1");

                if (CONSTS.cpu1Active) {
                    $('#stick-1').text("CPU 1");
                    window.cpu2 = setInterval(function () {
                        var ball = nearestBallToPlayer(1);
                        if (ball.top > CSS.stick1.top + CSS.stick.height / 2) {
                            CONSTS.stick1Speed = 5;
                        } else {
                            CONSTS.stick1Speed = -5;
                        }
                    }, 100);
                }
                break;
            case 2:
                clearInterval(window.cpu1);
                $('#stick-2').text("PLAYER 2");

                if (CONSTS.cpu2Active) {
                    $('#stick-2').text("CPU 2");
                    window.cpu1 = setInterval(function () {
                        var ball = nearestBallToPlayer(2);
                        if (ball.top > CSS.stick2.top + CSS.stick.height / 2) {
                            CONSTS.stick2Speed = 5;
                        } else {
                            CONSTS.stick2Speed = -5;
                        }
                    }, 100);
                }
                break;

        }
    }


    function writeLocalStore() {
        var saveGame = {CONSTS: CONSTS, CSS: CSS};
        localStorage.setItem("saveGame-ibrahim", JSON.stringify(saveGame));
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
        for (var i = 0; i < CONSTS.balls.length; i++) {

            //BALL ON THE LEFT
            if (CSS.balls[i].left <= CSS.stick.width) {
                CSS.balls[i].top > CSS.stick1.top && CSS.balls[i].top < CSS.stick1.top + CSS.stick.height && (CONSTS.balls[i].ballLeftSpeed = CONSTS.balls[i].ballLeftSpeed * -1)
                || playerLost(1);
            }

            //BALL ON THE RIGHT
            if (CSS.balls[i].left >= CSS.arena.width - CSS.ball.width - CSS.stick.width) {
                CSS.balls[i].top > CSS.stick2.top && CSS.balls[i].top < CSS.stick2.top + CSS.stick.height && (CONSTS.balls[i].ballLeftSpeed = CONSTS.balls[i].ballLeftSpeed * -1)
                || playerLost(2);
            }
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
            alert($('#stick-2').text() + ' Wins');

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
        for (var i = 0; i < CONSTS.balls.length; i++) {
            CSS.balls[i].top += CONSTS.balls[i].ballTopSpeed;
            CSS.balls[i].left += CONSTS.balls[i].ballLeftSpeed;

            if (CSS.balls[i].top <= 0 ||
                CSS.balls[i].top >= CSS.arena.height - CSS.ball.height) {
                CONSTS.balls[i].ballTopSpeed = CONSTS.balls[i].ballTopSpeed * -1;
            }

            $(`#pong-ball-${i}`).css({top: CSS.balls[i].top, left: CSS.balls[i].left});
        }
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
        for (var i = 0; i < CONSTS.balls.length; i++) {
            CSS.balls[i].top = 250;
            CSS.balls[i].left = 350;
        }

        CONSTS.balls.forEach(function (ball, i) {
            var side = -1;

            if (Math.random() < 0.5) {
                side = 1;
            }
            ball.ballTopSpeed = Math.random() * -2 - 3;
            ball.ballLeftSpeed = side * (Math.random() * 2 + 3);
        });

    }

    function addBall() {
        var side = -1;

        if (Math.random() < 0.5) {
            side = 1;
        }

        CONSTS.balls.push({ballTopSpeed: Math.random() * -2 - 3, ballLeftSpeed: side * (Math.random() * 2 + 3)});
        CSS.balls.push({top: 250, left: 350});

        $('<div/>', {id: `pong-ball-${CONSTS.balls.length - 1}`}).css($.extend(CSS.ball, CSS.balls[CONSTS.balls.length - 1])).appendTo('#pong-game');
    }

    function removeBall() {
        if (CONSTS.balls.length > 1) {
            $(`#pong-ball-${CONSTS.balls.length - 1}`).remove();
            CONSTS.balls.pop();
            CSS.balls.pop();
        }
    }

    function trailEffect() {
        clearInterval(window.trail);

        var TRAILCOUNT = 20;
        var TRAILINTERVAL = 50;
        if (CONSTS.trailEffect)
            window.trail = setInterval(function () {

                CSS.balls.forEach(function (ball, index) {
                    for (var i = 1; i <= TRAILCOUNT; i++) {
                        setTimeout((function (e) {
                            return function () {

                                $('<div/>', {id: `pong-ball-${index}-trail-${e}`}).css({
                                    top: ball.top,
                                    left: ball.left,
                                    opacity: 1 / e,
                                    width: 15,
                                    height: 15,
                                    position: 'absolute',
                                    borderRadius: 50,
                                    background: '#C6A62F',
                                }).appendTo('#pong-game');

                            }
                        })(i), TRAILINTERVAL * i);

                        setTimeout((function (e) {
                            return function () {
                                $(`#pong-ball-${index}-trail-${e}`).remove()
                            }
                        })(i), TRAILINTERVAL * i * 1.5)
                    }
                });
            }, TRAILINTERVAL * 5);
    }

    start();
})();
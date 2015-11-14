  var beginGame = function () {
    $("#myCanvas").hide();
    $(".breakout_game").hide();
    $(".falldown_game").hide();
    $(".high_scores").empty();
    $(".high_scores").hide();

    $(".play_breakout").on("click", startBreakout);
    $(".play_falldown").on("click", startFalldown);
  };

  var startBreakout = function() {
    $(".cover").hide();
    $("#myCanvas").show();
    $(".breakout_game").show();
    $(".play_breakout").hide();
    breakoutGameFunct();
  };

  var startFalldown = function() {
    $(".cover").hide();
    $("#myCanvas").show();
    $(".falldown_game").show();
    $(".play_falldown").hide();
    falldownGameFunct();
  };

  var highScores = function(userScore, game_url) {
    $("#myCanvas").hide();
    $(".high_scores").empty();
    $(".high_scores").show();

    $(".high_scores").append('<div class="game_over">Game Over! Your Score was '+ userScore + '</div>');
    $(".high_scores").append('<div class="all_time_highs">+++ ALL TIME HIGH SCORES +++</div>');
    $(".all_time_highs").append('<ol class="scores">');

    var $scores = $(".scores");

    $.ajax({
      type: "GET",
      url: game_url,
      dataType: "JSON",
      success: function(data) {
        $.each(data, function(i, item){
          if (i == 4) {
            if (userScore > item.score) {
              newHighScore();
            } else {
            $.each(data, function(i, item){
              $scores.append("<li>" + item.name + "..............." + item.score + "</li>");
            });
            playAgain();
          }
          }
        });
      }
    });

    var newHighScore = function() {
      $form = $('<form class="new_high_score"></form>');
      $(".high_scores").append($form);
      $form.append('<label class="new_high_score" for="nothing">NEW HIGH SCORE!</label>');
      $form.append('<label class="new_high_score initials" for="name">Enter your intitals</label>');
      $form.append('<input type="text" id="name">');
      $form.append('<input type="button" class="my_submit" id="submit" value="Submit">');

      $("#submit").on("click", function(){
        var newHighScore = {
          high_score: { name: $("#name").val(),
                        score: userScore }
        };

        $.ajax({
          type: "POST",
          url: game_url,
          data: newHighScore,
          success: function() {
            $form.hide();
            $.ajax({
              type: "GET",
              url: game_url,
              dataType: "JSON",
              success: function(data) {
                $.each(data, function(i, item){
                  $scores.append("<li>" + item.name + "..............." + item.score + "</li>");
                });
                playAgain();
              }
            });
          }
        });
      });
    };

    var playAgain = function() {
      $(".high_scores").append('<div class="play_again_container"></div>');
      $(".play_again_container").append('<div class="play_again">Play Again?</div>');
      $(".play_again_container").append('<div class="yes">Yes</div>');
      $(".play_again_container").append('<div class="no">No</div>');

      $(".play_again_container .yes").on("click", game);
      $(".play_again_container .no").on("click", reload);
    };

    var game = function() {
      if (game_url == "/breakout_high_scores") {
        beginGame();
        startBreakout();
      } else {
        beginGame();
        startFalldown();
      }
    };

    var reload = function() {
      location.reload();
    };
  };




  var breakoutGameFunct = function() {
   
    $(".pause").hide();

    var isGameOver = false;
    var death = new Audio("sounds/death.wav");
    var levelUp = new Audio("sounds/level_up.wav");
    var gameOver = new Audio("sounds/game_over.wav");
    var brokenBricks = 0;
    var level = 1;
    var lives = 3;
    var score = 0;
    var brickRowCount = 4;
    var brickColumnCount = 5;
    var brickWidth = 75;
    var brickHeight = 20;
    var brickPadding = 10;
    var brickOffsetTop = 30;
    var brickOffsetLeft = 60;
    var pauseGame = false;
    var togglePause = false;

    var bricks = [];
    for(c=0; c<brickColumnCount; c++) {
        bricks[c] = [];
        for(r=0; r<brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
    var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;

    function drawBricks() {
      for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
          if(bricks[c][r].status == 1) {
            var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
            var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    }

    function nextLevel() {
      for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
          bricks[c][r].status = 1;
        }
      }
      
      level++;
      brokenBricks = 0;
      x = canvas.width/2;
      y = canvas.height-30;
      paddleX = (canvas.width-paddleWidth)/2;

      if(dx > 0) {
        dx += 0.5;
      } else if (dx < 0) {
        dx -= 0.5;
      }

      if (dy > 0) {
        dy += 1.5;
      } else if (dy < 0) {
        dy -= 1.5;
      }
      paddleWidth -= 2;
    }

    var paddleHeight = 10;
    var paddleWidth = 75;

    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var paddleX = (canvas.width-paddleWidth)/2;

    var x = canvas.width/2;
    var y = canvas.height-30;

    var dx = 3;
    var dy = -3;

    var ballRadius = 10;

    var rightPressed = false;
    var leftPressed = false;

    function drawBall() {
      ctx.beginPath();
      movePaddle();
      checkPosition();
      collisionDetection();
      ctx.arc(x, y, ballRadius, 0, Math.PI*2);
      ctx.fill();
      ctx.closePath();
    }

    function movePaddle() {
      if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 10;
      }
      else if(leftPressed && paddleX > 0) {
        paddleX -= 10;
      }
    }

    function drawPaddle() {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.closePath();
    }

    function keyDownHandler(e) {

      if(e.keyCode == 39) {
        rightPressed = true;
      }
      else if(e.keyCode == 37) {
        leftPressed = true;
      }
      // 80 is the letter "p"
      else if(e.keyCode == 80) {
        if (togglePause === false) {
          $(".pause").show();
          togglePause = true;
          pauseGame = true;
        }
        else {
          $(".pause").hide();
          togglePause = false;
          pauseGame = false;
        }
      }
    }

    function keyUpHandler(e) {
      if(e.keyCode == 39) {
        rightPressed = false;
      }
      else if(e.keyCode == 37) {
        leftPressed = false;
      }
    }

    function collisionDetection() {
      for(c=0; c<brickColumnCount; c++) {
        for(r=0; r<brickRowCount; r++) {
          var b = bricks[c][r];
          if(b.status == 1) {
            if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
              dy = -dy;
              b.status = 0;
              brokenBricks ++;
              score ++;
              new Audio("sounds/brick_break.wav").play();
              if(brokenBricks == (brickColumnCount * brickRowCount) && lives > 0) {
                levelUp.play();
                alert("Level Completed, Click for next level");
                nextLevel();
              }
            }
          }
        }
      }
    }

    function drawScore() {
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "black";
      ctx.shadowColor = "grey";
      ctx.shadowOffsetY = 0.25;
      ctx.shadowOffsetX = 0.25;
      ctx.fillText("SCORE: "+score, 8, 20);
    }

    function drawLevel() {
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "black";
      ctx.shadowColor = "grey";
      ctx.shadowOffsetY = 0.25;
      ctx.shadowOffsetX = 0.25;
      ctx.fillText("LEVEL: "+level, canvas.width-300, 20);
    }

    function drawLives() {
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "black";
      ctx.shadowColor = "grey";
      ctx.shadowOffsetY = 0.25;
      ctx.shadowOffsetX = 0.25;
      ctx.fillText("LIVES: "+lives, canvas.width-65, 20);
    }

    function checkPosition() {
      if(y + 2 < ballRadius) {
        dy = -dy;
      } else if (y + 7 > canvas.height-ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
          dy = -dy;
          new Audio("sounds/bounce.wav").play();
        }
        else {
          lives--;
          if(!lives) {
            isGameOver = true;
            gameOver.play();
            drawGameOver();
          }
          else {
              death.play();
              alert("YOU DIED!");
              x = canvas.width/2;
              y = canvas.height-30;
              paddleX = (canvas.width-paddleWidth)/2;
          }
        }
      }

      if(x + dx < ballRadius) {
        dx = -dx;
      } else if (x+dx > canvas.width-ballRadius) {
        dx = -dx;
      }
    }

    function mouseMoveHandler(e) {
      var relativeX = e.clientX - canvas.offsetLeft;
      if(relativeX > 0 && relativeX < canvas.width) {
          paddleX = relativeX - paddleWidth/2;
      }
    }

    function drawGameOver() {
      ctx.clearRect(0,0, canvas.width, canvas.height);
      highScores(score, "/breakout_high_scores");
    }

    function draw() {
      if (pauseGame === false) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScore();
        drawLevel();
        drawLives();
        drawBricks();
        drawBall();
        drawPaddle();
        x += dx;
        y += dy;
        if (isGameOver === false) {
          requestAnimationFrame(draw);
        }
      } else {
        requestAnimationFrame(draw);
      }
    }

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    draw();
  };




var falldownGameFunct = function () {

  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");
  var gateSpeed = 2.5;
  var gateDistanceApart = 50;
  var gates = [];
  var gapSize = 50;
  var ballRadius = 10;
  var ballX = 20;
  var ballY = 20;
  var ballDropSpeed = 8;
  var ballRollSpeed = 6.75;
  var currentGate = 0;
  var ballGateTouchY = 0;
  var rightPressed = false;
  var leftPressed = false;


  function Gate() {
    this.gateDy = canvas.height;

    this.draw = function(ctx) {
      this.createGap();
      ctx.beginPath();
      ctx.rect(0, this.gateDy, this.startOfGap, 6);
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.rect(this.startOfGap+gapSize, this.gateDy, canvas.width, 6);
      ctx.fill();
      ctx.closePath();
    };

    this.createGap = function () {
      if(!this.startOfGap) {
        this.startOfGap = this.getRandom();
      }
    };

    this.getRandom = function() {
      return Math.random() * (((canvas.width-20) - 10) + 11);
    };

  }

  function buildAllGates() {
    while (gates.length < 2000) {
      var gate = new Gate();
      gate.createGap();
      gates.push(gate);
    }
  }

  function moveGates() {
    for (var i=0; i < gates.length-1; i++) {
      if (i === 0 || (gates[i].gateDy - gates[i-1].gateDy >= gateDistanceApart)) {
        gates[i].draw(ctx);
        gates[i].gateDy -= gateSpeed;
      }
    }
  }

  function drawBall() {
      ctx.beginPath();
      moveBallX();
      checkPosition();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
      ctx.fill();
      ctx.closePath();
  }

  function checkPosition() {
    // If the ball hits an opening in the gate
    if ((gates[currentGate].gateDy - ballY <= 10) && (ballX >= gates[currentGate].startOfGap) && (ballX < gates[currentGate].startOfGap + gapSize)) {
      currentGate += 1;
      new Audio("sounds/scoreup.wav").play();
      ballGateTouchY = 0;
      moveBallY(ballGateTouchY);
    }

    // If the ball hits a gate
    if (gates[currentGate].gateDy - ballY <= 10) {
      ballGateTouchY = gates[currentGate].gateDy - ballRadius;
      moveBallY(ballGateTouchY);
    }
    
  }

    function moveBallY(ballGateTouchY) {
      if (ballGateTouchY > 0) {
        ballY = ballGateTouchY;
      } else {
        ballY += ballDropSpeed;
      }

      ballGateTouchY = 0;
    }

  function keyDownHandler(e) {
    if(e.keyCode == 39) {
      rightPressed = true;
    }
    else if(e.keyCode == 37) {
      leftPressed = true;
    }
  }

  function keyUpHandler(e) {
    if(e.keyCode == 39) {
      rightPressed = false;
    }
    else if(e.keyCode == 37) {
      leftPressed = false;
    }
  }

  function moveBallX() {
    if(rightPressed && ballX < canvas.width-ballRadius) {
      ballX += ballRollSpeed;
    }
    else if(leftPressed && ballX > 10) {
      ballX -= ballRollSpeed;
    }
  }

  function drawScore() {
    ctx.font = "16px Arial";
    ctx.sfillStyle = "#0095DD";
    ctx.fillText("Score: "+ currentGate, 8, 20);
  }

  function increaseSpeed() {
    gateSpeed += 0.5;
  }

  function drawGameOver() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    highScores(currentGate, "/high_scores");
  }

  function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    moveBallX();
    moveBallY();
    moveGates();
    drawScore();

    if (ballY > 20) {
      requestAnimationFrame(run);
    } else {
      new Audio("sounds/fdgameover.wav").play();
      drawGameOver();
    }
  }

  buildAllGates();
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  run();
};
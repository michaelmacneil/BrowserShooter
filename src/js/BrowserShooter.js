// Initialize starting variables
PLAYER_VELOCITY=WAVE_VELOCITY=1
CANVAS_WIDTH=CANVAS_HEIGHT=400
PLAYER_HEIGHT=PLAYER_WIDTH=20
BULLET_WIDTH=BULLET_HEIGHT=5
TARGET_WIDTH=TARGET_HEIGHT=10
// Minimum interval value of setnterval (in milliseconds)
REFRESH_INTERVAL=10
var gameStats = new GameStats();

function PlayerMovement() {
  this.up=false;
  this.down=false;
  this.left=false;
  this.right=false;
}

function GameStats() {
  this.score = 0;
  this.highScore = 0;
  this.tInverval = 120;
  this.dInterval = 300;
  this.bulletOffset = 100;
  this.wInterval = 1000;
  this.tCount = 0;
  this.dCount = 0;
  this.wCount = 0;
}

function Player(x, y) {
  this.x = x;
  this.y = y;
  this.height = PLAYER_HEIGHT;
  this.width = PLAYER_WIDTH;
  this.color = "red";
  this.alive = true;
  this.bullets = [];
  this.movement = PlayerMovement();
}

window.onload=function() {
  canv=document.getElementById("canvas");
  ctx=canv.getContext("2d");

  // Create player in center of canvas
  var player = new Player((CANVAS_WIDTH-PLAYER_WIDTH)/2, (CANVAS_HEIGHT-PLAYER_HEIGHT)/2);

  // Set user input
  document.addEventListener("keydown", function(event) {
    player.movement = keyPush(event, player.movement)
  });
  document.addEventListener("keyup", function(event) {
    player.movement = keyRelease(event, player.movement);
  });
  document.addEventListener("mouseup", function(event) {
    player.bullets = mouseRelease(event, player);
  });

  // Create empty array for targets
  targets=[];
  // Starting targets
  targets.push({x:100,y:100,width:TARGET_WIDTH,height:TARGET_HEIGHT});
  targets.push({x:300,y:100,width:TARGET_WIDTH,height:TARGET_HEIGHT});
  targets.push({x:100,y:300,width:TARGET_WIDTH,height:TARGET_HEIGHT});
  targets.push({x:300,y:300,width:TARGET_WIDTH,height:TARGET_HEIGHT});

  // Set how often the game method is called
  setInterval(function(){[player, targets]=game(player, targets)}, REFRESH_INTERVAL);
}

// Return a random number between min and max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Collision detection for two rectangles
function wouldCollide(aX, aY, aW, aH, bX, bY, bW, bH) {
  if ( aX < bX + bW &&
       aX + aW > bX &&
       aY < bY + bH &&
       aY + aH > bY ) {
         return true;
       } else {
         return false;
       }
}

function updateTargets(player, targets) {
  // When target couner reaches target interval add new target
  gameStats.tCount += 1
  if (gameStats.tCount === gameStats.tInverval) {
    // Ensure generated target would not be within 10 pixels of player character
    do {
      ranX = getRandomInt(0,400-TARGET_WIDTH);
      ranY = getRandomInt(0,400-TARGET_HEIGHT);
    }
    while (wouldCollide(player.x-10,player.y-10,player.width+20,player.height+20,ranX,ranY,TARGET_WIDTH,TARGET_HEIGHT));
    targets.push({x:ranX,y:ranY,width:TARGET_WIDTH,height:TARGET_HEIGHT,wave:false});
    gameStats.tCount = 0;
  }

  // Send wave of targets
  gameStats.wCount += 1
  if (gameStats.wCount === gameStats.wInterval) {
    direction = getRandomInt(1,4);
    switch (direction) {
      case 1: waveDirection = "left";
      for (var i=0; i < CANVAS_HEIGHT; i += TARGET_HEIGHT) {
        targets.push({x:400,y:i,width:TARGET_WIDTH,height:TARGET_HEIGHT,wave:true});
      }
      break;

      case 2: waveDirection = "up";
      for (var i=0; i < CANVAS_WIDTH; i += TARGET_WIDTH) {
        targets.push({x:i,y:400,width:TARGET_WIDTH,height:TARGET_HEIGHT,wave:true});
      }
      break;

      case 3: waveDirection = "right";
      for (var i=0; i < CANVAS_HEIGHT; i += TARGET_HEIGHT) {
        targets.push({x:0,y:i,width:TARGET_WIDTH,height:TARGET_HEIGHT,wave:true});
      }
      break;

      case 4: waveDirection = "down";
      for (var i=0; i < CANVAS_HEIGHT; i += TARGET_HEIGHT) {
        targets.push({x:i,y:0,width:TARGET_WIDTH,height:TARGET_HEIGHT,wave:true});
      }
      break;
    }

    gameStats.wCount = 0;
  }

  // Move wave
  for (var i=0; i < targets.length; i++) {
    if (targets[i].wave) {
      switch (waveDirection) {
        case "left": targets[i].x -= WAVE_VELOCITY;
        break;

        case "up": targets[i].y -= WAVE_VELOCITY;
        break;

        case "right": targets[i].x += WAVE_VELOCITY;
        break;

        case "down": targets[i].y += WAVE_VELOCITY;
        break;
      }
    }
    if (targets[i].x < -1 * BULLET_WIDTH || targets[i].x > CANVAS_WIDTH + BULLET_WIDTH || targets[i].y < -1 * BULLET_HEIGHT || targets[i].y > CANVAS_HEIGHT + BULLET_HEIGHT) {
      targets.splice(i, 1);
    }
  }
  return targets;
}

function bulletCollision(bullets, targets) {
  // Bullet collsion logic and display
  for (var i=0; i < bullets.length; i++) {
    bullets[i].x += bullets[i].dx;
    bullets[i].y += bullets[i].dy;
    collision = false;
    for (j=0; j < targets.length; j++) {
      // if bullet i and target j overlap
      if (wouldCollide(bullets[i].x,bullets[i].y,bullets[i].width,bullets[i].height,targets[j].x,targets[j].y,targets[j].width,targets[j].height)) {
        collison = true;
        targets.splice(j, 1);
      }
    }
    if (bullets[i].x > 400 || bullets[i].x < -5 || bullets[i].y > 400 || bullets[i].x < -5 || collision) {
      bullets.splice(i, 1);
    } else {
      ctx.fillRect(bullets[i].x,bullets[i].y, BULLET_WIDTH, BULLET_HEIGHT);
    }
  }
  return targets;
}

function drawTargets(targets) {
  // Draw targets
  for (var i=0; i < targets.length; i++){
    ctx.fillStyle="white";
    ctx.fillRect(targets[i].x,targets[i].y, targets[i].width, targets[i].height);
  }
}

// See if player has collided with a target
// Returns true if the
function playerCollidedWithTarget(player, targets) {
  // Collision detection logic for targets with player
  for (var i=0; i < targets.length; i++) {
    if (wouldCollide(player.x,player.y,player.width,player.height,targets[i].x,targets[i].y,targets[i].width,targets[i].height)) {
           // player collided with target - restart Game
           return true;
    }
  }
  return false;
}

// Game refresh
function game(player, targets) {
  if (player.alive) {
    // Update player movement
    if (player.movement.left)
      player.x -= PLAYER_VELOCITY;
    if (player.movement.right)
      player.x += PLAYER_VELOCITY;
    if (player.movement.up)
      player.y -= PLAYER_VELOCITY;
    if (player.movement.down)
      player.y += PLAYER_VELOCITY;

    // Loop player to other side of canvas if about to go offscreen
    if (player.x > CANVAS_WIDTH)
      player.x = -1*PLAYER_WIDTH;
    if (player.x < -1*PLAYER_WIDTH)
      player.x = CANVAS_WIDTH
    if (player.y > CANVAS_HEIGHT)
      player.y = -1*PLAYER_HEIGHT;
    if (player.y < -1*PLAYER_HEIGHT)
      player.y = CANVAS_HEIGHT

    // Draw canvas
    ctx.fillStyle="black";
    ctx.fillRect(0,0,canv.width,canv.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    targets = updateTargets(player, targets);

    targets = bulletCollision(player.bullets, targets);

    gameStats.score += 1;
    if (playerCollidedWithTarget(player, targets)) {
      player.alive = false;
      dCount = 0;
      document.getElementById('message').innerHTML = "You have died!";
      if (gameStats.score > gameStats.highScore) {
        gameStats.highScore = gameStats.score;
        document.getElementById('message').innerHTML += " But you got a High score!";
      }
    }

    drawTargets(targets);

    document.getElementById('currentScore').innerHTML = gameStats.score;
    document.getElementById('highScore').innerHTML = gameStats.highScore;
  } else {
    // player is dead
    if (gameStats.dCount === gameStats.dInterval) {
      player.alive = true;
      player.x = CANVAS_WIDTH/2;
      player.y = CANVAS_HEIGHT/2;

      gameStats.tCount = gameStats.dCount = gameStats.wCount = gameStats.score = 0
      targets = [];
      player.bullets = [];

      document.getElementById('message').innerHTML = "Goal - Avoid the targets and survive for as long as possible!";

      // Starting targets
      targets.push({x:100,y:100,width:TARGET_WIDTH,height:TARGET_HEIGHT});
      targets.push({x:300,y:100,width:TARGET_WIDTH,height:TARGET_HEIGHT});
      targets.push({x:100,y:300,width:TARGET_WIDTH,height:TARGET_HEIGHT});
      targets.push({x:300,y:300,width:TARGET_WIDTH,height:TARGET_HEIGHT});
    } else {
      gameStats.dCount += 1;
    }
  }
  return [player, targets];
}

// Create a bullet on mouse release
function mouseRelease(evt, player) {
  player.bullets.push(
  {
    x:player.x + player.width/2,
    y:player.y + player.height/2,
    height:BULLET_HEIGHT,
    width:BULLET_WIDTH,
    dx:((evt.offsetX-player.x)/gameStats.bulletOffset),
    dy:((evt.offsetY-player.y)/gameStats.bulletOffset)
  });
  return player.bullets;
}

// Set direction on keypush
function keyPush(evt, playerMovement) {
    switch(evt.keyCode) {
        case 65:
            playerMovement.left=true
            break;
        case 87:
            playerMovement.up=true
            break;
        case 68:
            playerMovement.right=true
            break;
        case 83:
            playerMovement.down=true
            break;
    }
    return playerMovement;
}

// Release direction on keyrelease
function keyRelease(evt, playerMovement) {
    switch(evt.keyCode) {
        case 65:
            playerMovement.left=false
            break;
        case 87:
            playerMovement.up=false
            break;
        case 68:
            playerMovement.right=false
            break;
        case 83:
            playerMovement.down=false
            break;
    }
    return playerMovement;
}

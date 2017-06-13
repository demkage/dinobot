var rawCheckForCollision = checkForCollision.bind();

Runner.instance_.defaultUpdate = function() {
    Runner.instance_.updatePending = false;

    var now = Math.floor(Date.now());
    var deltaTime = now - (Runner.instance_.time || now);
    Runner.instance_.time = now;

    if (Runner.instance_.playing) {
      Runner.instance_.clearCanvas();

      if (Runner.instance_.tRex.jumping) {
        Runner.instance_.tRex.updateJump(deltaTime);
      }

      Runner.instance_.runningTime += deltaTime;
      var hasObstacles = Runner.instance_.runningTime > Runner.instance_.config.CLEAR_TIME;

      // First jump triggers the intro.
      if (Runner.instance_.tRex.jumpCount == 1 && !Runner.instance_.playingIntro) {
        Runner.instance_.playIntro();
      }

      // The horizon doesn't move until the intro is over.
      if (Runner.instance_.playingIntro) {
        Runner.instance_.horizon.update(0, Runner.instance_.currentSpeed, hasObstacles);
      } else {
        deltaTime = !Runner.instance_.activated ? 0 : deltaTime;
        Runner.instance_.horizon.update(deltaTime, Runner.instance_.currentSpeed, hasObstacles,
            Runner.instance_.inverted);
      }

      // Check for collisions.
      var collision = hasObstacles &&
          rawCheckForCollision(Runner.instance_.horizon.obstacles[0], Runner.instance_.tRex);

      if (!collision) {
        Runner.instance_.distanceRan += Runner.instance_.currentSpeed * deltaTime / Runner.instance_.msPerFrame;

        if (Runner.instance_.currentSpeed < Runner.instance_.config.MAX_SPEED) {
          Runner.instance_.currentSpeed += Runner.instance_.config.ACCELERATION;
        }
      } else {
        Runner.instance_.gameOver();
      }

      var playAchievementSound = Runner.instance_.distanceMeter.update(deltaTime,
          Math.ceil(Runner.instance_.distanceRan));

      if (playAchievementSound) {
        Runner.instance_.playSound(Runner.instance_.soundFx.SCORE);
      }

      // Night mode.
      if (Runner.instance_.invertTimer > Runner.instance_.config.INVERT_FADE_DURATION) {
        Runner.instance_.invertTimer = 0;
        Runner.instance_.invertTrigger = false;
        Runner.instance_.invert();
      } else if (Runner.instance_.invertTimer) {
        Runner.instance_.invertTimer += deltaTime;
      } else {
        var actualDistance =
            Runner.instance_.distanceMeter.getActualDistance(Math.ceil(Runner.instance_.distanceRan));

        if (actualDistance > 0) {
          Runner.instance_.invertTrigger = !(actualDistance %
              Runner.instance_.config.INVERT_DISTANCE);

          if (Runner.instance_.invertTrigger && Runner.instance_.invertTimer === 0) {
            Runner.instance_.invertTimer += deltaTime;
            Runner.instance_.invert();
          }
        }
      }
    }

    if (Runner.instance_.playing || (!Runner.instance_.activated &&
        Runner.instance_.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)) {
      Runner.instance_.tRex.update(deltaTime);
      Runner.instance_.scheduleNextUpdate();
    }
  }
  

var closeObstacle = function(obstacle) {
	return obstacle;
}

var checkUFOCollisionAfterSetDuck = function(obstacle) {
	
	if(obstacle != Runner.instance_.horizon.obstacles[0])
		Runner.instance_.tRex.setDuck(false);
	else 
		setTimeout(function() { checkUFOCollisionAfterSetDuck(closeObstacle(obstacle)) }, 75);
} 
 
Runner.instance_.update = function() { 
	var hasObstacles = Runner.instance_.runningTime > Runner.instance_.config.CLEAR_TIME;
	
	if(hasObstacles && Runner.instance_.tRex != null) {
		var predictedObstacle = JSON.parse(JSON.stringify(Runner.instance_.horizon.obstacles[0]));

		if(predictedObstacle != null || predictedObstacle.xPos != null) {
			predictedObstacle.xPos -= 2*Math.pow(Runner.instance_.currentSpeed/2, 2)  +  Runner.instance_.currentSpeed * 5;
			
			if(rawCheckForCollision(predictedObstacle, Runner.instance_.tRex)) {
				if(Runner.instance_.horizon.obstacles[0].yPos < 89) {
					Runner.instance_.tRex.setDuck(true);
					setTimeout(function() { checkUFOCollisionAfterSetDuck(closeObstacle(Runner.instance_.horizon.obstacles[0])) }, 75);
				} else {
						Runner.instance_.tRex.startJump(Runner.instance_.currentSpeed);
				}
			}
		}
	}
	
	Runner.instance_.defaultUpdate(); 
}


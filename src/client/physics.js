export function contain (sprite, container) {
  var collision

  if (sprite.x < container.x) {
    sprite.x = container.x
    collision = 'left'
  }

  if (sprite.y < container.y) {
    sprite.y = container.y
    collision = 'top'
  }

  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width
    collision = 'right'
  }

  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height
    collision = 'bottom'
  }

  return collision
}

export function verticalMovement (ball, topBar, bottomBar) {
  var futureBall = getFutureBall(ball)
  var topColl = willCollideTop(futureBall, topBar)
  var bottomColl = willCollideBottom(futureBall, bottomBar)
  var beforeCollision = ball.vy * ball.speed
  var afterCollision = 0
  var distance
  if (topColl) {
    distance = deltaY(ball, topBar)
  } else if (bottomColl) {
    distance = deltaY(ball, bottomBar)
  }
  if (topColl || bottomColl) {
    beforeCollision = distance
    ball.vy *= -1
    afterCollision = ball.vy * ball.speed - distance
  }

  ball.y += beforeCollision + afterCollision
}

export function horizontalMovement (ball, rectangle, rectangle2) {
  var futureBall = getFutureBall(ball)
  var leftColl = willCollideLeft(futureBall, rectangle)
  var rightColl = willCollideRight(futureBall, rectangle2)
  var beforeCollision, afterCollision
  var distance
  var collRect
  if (leftColl) {
    distance = deltaX(ball, rectangle)
    collRect = rectangle
  } else if (rightColl) {
    distance = deltaX(ball, rectangle2)
    collRect = rectangle2
  }
  if (leftColl || rightColl) {
    beforeCollision = distance
    ball.x += beforeCollision
    changeSpeed(ball)
    changeDirection(ball, collRect)
    afterCollision = ball.vx * ball.speed - distance
    ball.x += afterCollision
  } else {
    ball.x += ball.vx * ball.speed
  }
}

function getFutureBall (ball) {
  return {
    'y': ball.y + ball.vy * ball.speed,
    'x': ball.x + ball.vx * ball.speed,
    'height': ball.height,
    'width': ball.width
  }
}

function changeSpeed (ball) {
  if (ball.speed < 10) {
    ball.speed += 1
  }
}

function changeDirection (ball, collRect) {
  var position = getCollisionPosition(ball, collRect)
  var angle = (2 * 1 / collRect.height) * position - 1
  var cos = Math.cos(angle)
  var sin = Math.sin(angle)
  if (ball.vx < 0) {
    ball.vx = cos
  } else {
    ball.vx = -cos
  }
  ball.vy = sin
}

function getCollisionPosition (ball, collRect) {
  return Math.max(0, ball.y - collRect.y + ball.height / 2)
}

function willCollideLeft (futureBall, obj) {
  return futureBall.x < obj.x + obj.width
    && deltaY(futureBall, obj) === 0
    && deltaX(futureBall, obj) === 0
}

function willCollideRight (futureBall, obj) {
  return futureBall.x > obj.x
    && deltaY(futureBall, obj) === 0
    && deltaX(futureBall, obj) === 0
}

function willCollideTop (futureBall, obj) {
  return futureBall.y < obj.y + obj.height
}

function willCollideBottom (futureBall, obj) {
  return futureBall.y + futureBall.height > obj.y
}

function deltaY (obj1, obj2) {
  var isOnTop = obj1.y + obj1.height < obj2.y
  var isOnBottom = obj2.y + obj2.height < obj1.y
  if (isOnTop) {
    return obj2.y - obj1.y - obj1.height
  } else if (isOnBottom) {
    return obj2.y + obj2.height - obj1.y
  } else {
    // they're intersecting
    return 0
  }
}

function deltaX (obj1, obj2) {
  var isOnLeft = obj1.x + obj1.width < obj2.x
  var isOnRight = obj2.x + obj2.width < obj1.x
  if (isOnLeft) {
    return obj2.x - obj1.x - obj1.width
  } else if (isOnRight) {
    return obj2.x + obj2.width - obj1.x
  } else {
    // they're intersecting
    return 0
  }
}

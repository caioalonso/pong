'use strict'

import 'babel-polyfill'
import IO from 'socket.io-client'
import WebFont from 'webfontloader'
import { Graphics, Container, Text, TextStyle, autoDetectRenderer } from 'pixi.js'
import { GAME } from '../shared/config'
import { registerAction } from './keyboard'

var socket = IO()
socket.on('sync', data => {
  rectangle2.y = data.y
})

var renderer, stage, topBar, bottomBar, line, rectangle, rectangle2, ball
var message, message2

function setup () {
  renderer = autoDetectRenderer()
  stage = new Container()

  document.body.appendChild(renderer.view)

  line = new Graphics()
  line.lineStyle(4, 0x333333)
  line.moveTo(0, 0)
  line.lineTo(0, renderer.height)
  line.x = renderer.width / 2
  line.y = 0
  stage.addChild(line)

  topBar = new Graphics()
  topBar.beginFill(0xFFFFFF)
  topBar.drawRect(0, 0, renderer.width, GAME.barHeight)
  topBar.endFill()
  topBar.position.set(0, 0)
  stage.addChild(topBar)

  bottomBar = new Graphics()
  bottomBar.beginFill(0xFFFFFF)
  bottomBar.drawRect(0, 0, renderer.width, GAME.barHeight)
  bottomBar.endFill()
  bottomBar.position.set(0, renderer.height - GAME.barHeight)
  stage.addChild(bottomBar)

  var scoreStyle = {
    fontFamily: 'FFF',
    fontSize: '32px',
    fill: '#AAAAAA'
  }
  message = new Text('0', scoreStyle)
  message.position.set(renderer.width / 2 + GAME.centerSpacing, GAME.topPadding)
  stage.addChild(message)

  message2 = new Text('0', scoreStyle)
  message2.position.set(renderer.width / 2 - message2.width - GAME.centerSpacing, GAME.topPadding)
  stage.addChild(message2)

  rectangle = new Graphics()
  rectangle.beginFill(0xFFFFFF)
  rectangle.drawRect(0, 0, GAME.rectWidth, GAME.rectHeight())
  rectangle.endFill()
  rectangle.position.set(GAME.rectMargin, renderer.height / 2 - rectangle.height / 2)
  rectangle.vy = 0
  stage.addChild(rectangle)

  rectangle2 = new Graphics()
  rectangle2.beginFill(0xFFFFFF)
  rectangle2.drawRect(0, 0, GAME.rectWidth, GAME.rectHeight())
  rectangle2.endFill()
  rectangle2.position.set(renderer.width - rectangle2.width - GAME.rectMargin, renderer.height / 2 - rectangle2.height / 2)
  stage.addChild(rectangle2)

  ball = new Graphics()
  ball.beginFill(0xFFFFFF)
  ball.drawRect(0, 0, GAME.ballSize(), GAME.ballSize())
  ball.endFill()
  ball.position.set(renderer.width / 2, renderer.height / 2 - ball.height / 2)
  ball.vx = -1
  ball.vy = 0
  ball.speed = 5
  stage.addChild(ball)

  registerAction('up',
  () => rectangle.vy = -7,
  () => rectangle.vy = 0)

  registerAction('down',
  () => rectangle.vy = 7,
  () => rectangle.vy = 0)

  setInterval(() => {
    var info = {y: rectangle.y}
    socket.json.emit('sync', info)
  }, 30)

  window.onresize = resizeInterface
  resizeInterface()
  renderer.render(stage)
  gameLoop()
}

function resizeInterface (event) {
  var ratio = Math.min(window.innerWidth/800, window.innerHeight/600)
  var newWidth = Math.ceil(800 * ratio)
  var newHeight = Math.ceil(600 * ratio)
  renderer.view.style.width = newWidth + 'px'
  renderer.view.style.height = newHeight + 'px'
}

function gameLoop () {
  var container = {
    x: 0,
    y: topBar.height,
    width: renderer.width,
    height: renderer.height - topBar.height
  }
  requestAnimationFrame(gameLoop)

  rectangle.y += rectangle.vy
  contain(rectangle, container)
  horizontalMovement(ball)
  verticalMovement(ball)

  renderer.render(stage)
}

function contain (sprite, container) {
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

function verticalMovement (ball) {
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
  if (topColl|| bottomColl) {
    beforeCollision = distance
    ball.vy *= -1
    afterCollision = ball.vy * ball.speed - distance
  }

  ball.y += beforeCollision + afterCollision
}

function horizontalMovement (ball) {
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

function getFutureBall(ball) {
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
  var angle = (2*1 / collRect.height) * position - 1
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  if(ball.vx < 0) {
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
  var isOnTop    = obj1.y + obj1.height < obj2.y
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
  var isOnLeft  = obj1.x + obj1.width < obj2.x
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

WebFont.load({
  custom: {
    families: ['FFF']
  },
  active: setup
})


'use strict'

import 'babel-polyfill'
import IO from 'socket.io-client'
import Bump from 'bump.js'
import WebFont from 'webfontloader'
import {Graphics, Container, Text, TextStyle, autoDetectRenderer} from 'pixi.js'

var socket = IO()
socket.on('sync', data => {
  rectangle2.y = data.y
})

var renderer, stage, topBar, bottomBar, line, rectangle, rectangle2, ball
var bump
var message, message2
var barHeight = 10
var centerSpacing = 60
var topPadding = 0
var rectWidth = 10
var rectHeight = () => window.innerHeight / 10
var rectMargin = 20
var ballSize = () => window.innerHeight / 100

function setup () {
  renderer = autoDetectRenderer()
  stage = new Container()
  bump = new Bump(PIXI)

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
  topBar.drawRect(0, 0, renderer.width, barHeight)
  topBar.endFill()
  topBar.position.set(0, 0)
  stage.addChild(topBar)

  bottomBar = new Graphics()
  bottomBar.beginFill(0xFFFFFF)
  bottomBar.drawRect(0, 0, renderer.width, barHeight)
  bottomBar.endFill()
  bottomBar.position.set(0, renderer.height - barHeight)
  stage.addChild(bottomBar)

  var scoreStyle = {
    fontFamily: 'FFF',
    fontSize: '32px',
    fill: '#AAAAAA'
  }
  message = new Text('0', scoreStyle)
  message.position.set(renderer.width / 2 + centerSpacing, topPadding)
  stage.addChild(message)

  message2 = new Text('0', scoreStyle)
  message2.position.set(renderer.width / 2 - message2.width - centerSpacing, topPadding)
  stage.addChild(message2)

  rectangle = new Graphics()
  rectangle.beginFill(0xFFFFFF)
  rectangle.drawRect(0, 0, rectWidth, rectHeight())
  rectangle.endFill()
  rectangle.position.set(rectMargin, 0)
  rectangle.vy = 0
  stage.addChild(rectangle)

  rectangle2 = new Graphics()
  rectangle2.beginFill(0xFFFFFF)
  rectangle2.drawRect(0, 0, rectWidth, rectHeight())
  rectangle2.endFill()
  rectangle2.position.set(renderer.width - rectangle2.width - rectMargin, 0)
  stage.addChild(rectangle2)

  ball = new Graphics()
  ball.beginFill(0xFFFFFF)
  ball.drawRect(0, 0, ballSize(), ballSize())
  ball.endFill()
  ball.position.set(renderer.width / 2, 300)
  ball.vx = -5
  ball.vy = -1
  stage.addChild(ball)

  var up = keyboard(38)
  var down = keyboard(40)
  up.press = () => rectangle.vy = -7
  up.release = () => {
    if(!down.isDown) {
      rectangle.vy = 0
    }
  }

  down.press = () => rectangle.vy = 7
  down.release = () => {
    if(!up.isDown) {
      rectangle.vy = 0
    }
  }

  setInterval(() => {
    var info = {y: rectangle.y}
    socket.json.emit('sync', info)
  }, 50)

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

var collision

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

  bump.hit(ball, rectangle, true, true, false)
  bump.hit(ball, rectangle2, true, true, false)
  bump.hit(ball, topBar, true, true, false)
  bump.hit(ball, bottomBar, true, true, false)
  ball.x += ball.vx
  ball.y += ball.vy

  renderer.render(stage)
}

function keyboard (keyCode) {
  var key = {}
  key.code = keyCode
  key.isDown = false
  key.isUp = true
  key.press = undefined
  key.release = undefined
  key.downHandler = (event) => {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press()
      key.isDown = true
      key.isUp = false
      event.preventDefault()
    }
  }

  key.upHandler = (event) => {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release()
      key.isDown = false
      key.isUp = true
      event.preventDefault()
    }
  }

  window.addEventListener(
    'keydown', key.downHandler.bind(key), false
  )
  window.addEventListener(
    'keyup', key.upHandler.bind(key), false
  )
  return key
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

WebFont.load({
  custom: {
    families: ['FFF']
  },
  active: setup
})


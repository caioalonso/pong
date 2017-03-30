'use strict'

import 'babel-polyfill'
import IO from 'socket.io-client'
import WebFont from 'webfontloader'
import { Graphics, Container, Text, TextStyle, autoDetectRenderer } from 'pixi.js'
import { GAME } from '../shared/config'
import { registerAction } from './keyboard'
import { contain, horizontalMovement, verticalMovement } from './physics'

var renderer, stage, topBar, bottomBar, line, rectangle, rectangle2, ball
var message, message2
var room

function setup () {
  var socket = IO()
  socket.on('connect', () => {
    room = getURLRoom()
    socket.emit('room', room)
  })

  socket.on('sync', data => {
    rectangle2.y = data.y
  })

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

function getURLRoom () {
  var room = window.location.href.split('/').pop()
  if(room != '') {
    return room
  } else {
    return null
  }
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
  horizontalMovement(ball, rectangle, rectangle2)
  verticalMovement(ball, topBar, bottomBar)

  renderer.render(stage)
}

function start () {
  if(getURLRoom() !== null) {
    setup()
  } else {
    document.getElementById('pregame').style.display = 'block'
  }
}

var button = document.getElementById('join')
button.onclick = () => {
  var roomName = document.getElementById('roomName').value
  if(roomName === '') {
    roomName = stringGen(8)
  }
  window.location.href = roomName
}

function stringGen (len) {
    var text = ' '
    var charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
    for(var i=0; i < len; i++) {
      text += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return text
}

WebFont.load({
  custom: {
    families: ['FFF']
  },
  active: start
})

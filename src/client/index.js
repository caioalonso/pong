'use strict'

import 'babel-polyfill'
import IO from 'socket.io-client'
import WebFont from 'webfontloader'
import { Graphics, Container, Text, autoDetectRenderer } from 'pixi.js'
import { GAME } from '../shared/config'
import { registerAction } from './keyboard'
import { contain, horizontalMovement, verticalMovement } from './physics'

var $ = document.querySelector.bind(document)
var renderer, stage, topBar, bottomBar, line, rectangle, rectangle2, ball
var readyBar1, readyBar2, ready1, ready2
var scoreMsg = []
var info
var score = [0, 0]
var socket
var room
var gameStatus = 'disconnected'
var player = 1
var playerRect

var scoreStyle = {
  fontFamily: 'FFF',
  fontSize: '32px',
  fill: '#AAAAAA'
}

var infoStyle = {
  fontFamily: 'FFF',
  fontSize: '24px',
  fill: '#FFFFFF'
}

var readyStyle = {
  fontFamily: 'FFF',
  fontSize: '24px',
  fill: '#555555'
}

function setup () {
  renderer = autoDetectRenderer()
  stage = new Container()
  document.body.appendChild(renderer.view)

  readyBar1 = new Graphics()
  stage.addChild(readyBar1)

  ready1 = new Text('', readyStyle)
  stage.addChild(ready1)

  readyBar2 = new Graphics()
  stage.addChild(readyBar2)

  ready2 = new Text('', readyStyle)
  stage.addChild(ready2)

  line = new Graphics()
  line.cacheAsBitmap = true
  line.lineStyle(4, 0x333333)
  line.moveTo(0, 0)
  line.lineTo(0, renderer.height)
  line.x = renderer.width / 2
  line.y = 0
  stage.addChild(line)

  topBar = new Graphics()
  topBar.cacheAsBitmap = true
  topBar.beginFill(0xFFFFFF)
  topBar.drawRect(0, 0, renderer.width, GAME.barHeight)
  topBar.endFill()
  topBar.position.set(0, 0)
  stage.addChild(topBar)

  bottomBar = new Graphics()
  bottomBar.cacheAsBitmap = true
  bottomBar.beginFill(0xFFFFFF)
  bottomBar.drawRect(0, 0, renderer.width, GAME.barHeight)
  bottomBar.endFill()
  bottomBar.position.set(0, renderer.height - GAME.barHeight)
  stage.addChild(bottomBar)

  info = new Text('Connecting...', infoStyle)
  info.position.set(renderer.width / 2 - info.width / 2, GAME.topPadding)
  stage.addChild(info)

  scoreMsg[0] = new Text('', scoreStyle)
  scoreMsg[0].position.set(renderer.width / 2 + GAME.centerSpacing, GAME.topPadding)
  stage.addChild(scoreMsg[0])

  scoreMsg[1] = new Text('', scoreStyle)
  scoreMsg[1].position.set(renderer.width / 2 - scoreMsg[1].width - GAME.centerSpacing, GAME.topPadding)
  stage.addChild(scoreMsg[1])

  rectangle = new Graphics()
  rectangle.cacheAsBitmap = true
  rectangle.beginFill(0xFFFFFF)
  rectangle.drawRect(0, 0, GAME.rectWidth, GAME.rectHeight)
  rectangle.endFill()
  rectangle.position.set(GAME.rectMargin, renderer.height / 2 - rectangle.height / 2)
  rectangle.vy = 0
  stage.addChild(rectangle)

  rectangle2 = new Graphics()
  rectangle2.cacheAsBitmap = true
  rectangle2.beginFill(0xFFFFFF)
  rectangle2.drawRect(0, 0, GAME.rectWidth, GAME.rectHeight)
  rectangle2.endFill()
  rectangle2.position.set(
    renderer.width - rectangle2.width - GAME.rectMargin,
    renderer.height / 2 - rectangle2.height / 2)
  rectangle2.vy = 0
  stage.addChild(rectangle2)

  playerRect = rectangle2

  ball = new Graphics()
  ball.cacheAsBitmap = true
  ball.x = 10
  ball.y = 10

  window.onresize = resizeInterface
  resizeInterface()
  setupNetwork()
  renderer.render(stage)
  gameLoop()
}

function setupNetwork () {
  socket = IO()
  socket.on('connect', () => {
    gameStatus = 'connected'
    room = getURLRoom()
    socket.emit('room', room)
  })

  socket.on('joined', (data) => {
    for (let client in data.clients) {
      if (data.clients[client] === socket.id) {
        setPlayer(client)
      }
    }
    setState(data.clients.length)
    console.log('I am player ' + (player + 1))

    registerAction('up',
      () => {
        playerRect.vy = -7
      }
          ,
      () => {
        playerRect.vy = 0
      })

    registerAction('down',
      () => {
        playerRect.vy = 7
      },
      () => {
        playerRect.vy = 0
      })

    registerAction('space',
      () => imReady(),
      () => {})

    setInterval(sendSync, 10)
  })

  socket.on('disconnected', id => {
    stopMatch()
    player = 0
    playerRect = rectangle
    gameStatus = 'waiting'
    setInfo('Waiting for second player...')
  })

  socket.on('ready', () => makeReady(!player))

  socket.on('start', () => startMatch())

  socket.on('sync', (data) => {
    if (data.player === '1') {
      rectangle2.y = data.y
      rectangle2.vy = data.vy
    } else if (data.player === 0) {
      rectangle.y = data.y
      rectangle.vy = data.vy
    }

    if (isInEnemySide(ball)) {
      if (score[0] < data.score[0]) {
        score[0] = data.score[0]
      }
      if (score[1] < data.score[1]) {
        score[1] = data.score[1]
      }
      ball.x = data.ball.x
      ball.y = data.ball.y
      ball.vx = data.ball.vx
      ball.vy = data.ball.vy
      ball.speed = data.ball.speed
    }
  })
}

function setPlayer (number) {
  if (number === 0) {
    player = 0
    playerRect = rectangle
    gameStatus = 'waiting'
    setInfo('Waiting for Player 2...')
  } else if (number === 1) {
    player = 1
    playerRect = rectangle2
    gameStatus = 'readiness'
    setInfo('Press space to be ready')
  }
}

function setState (players) {
  if (players === 1) {
    gameStatus = 'waiting'
    setInfo('Waiting for Player 2...')
  } else if (players === 2) {
    gameStatus = 'readiness'
    setInfo('Press space to be ready')
  }
}

function sendSync () {
  var toSend = {
    player,
    y: playerRect.y,
    vy: playerRect.vy,
    ball: {
      y: ball.y,
      x: ball.x,
      vy: ball.vy,
      vx: ball.vx,
      speed: ball.speed
    },
    score
  }
  socket.json.emit('sync', toSend)
}

function isInEnemySide (ball) {
  if (player === 0) {
    return ball.x > renderer.width / 2
  } else {
    return ball.x < renderer.width / 2
  }
}

function imReady () {
  if (gameStatus === 'readiness') {
    makeReady(player)
    socket.emit('ready')
  }
}

function makeReady (player) {
  if (player === 0) {
    readyBar1.beginFill(0x222222)
    readyBar1.drawRect(0, 0, renderer.width / 2, renderer.height)
    readyBar1.endFill()
    readyBar1.position.set(0, 0)
    ready1.text = 'Ready'
    ready1.position.set(renderer.width / 4 - ready1.width / 2, GAME.readyPadding)
  } else if (player === 1) {
    readyBar2.beginFill(0x222222)
    readyBar2.drawRect(0, 0, renderer.width / 2, renderer.height)
    readyBar2.endFill()
    readyBar2.position.set(renderer.width / 2, 0)
    ready2.text = 'Ready'
    ready2.position.set(renderer.width - renderer.width / 4 - ready2.width / 2, GAME.readyPadding)
  }
}

function unReady () {
  ready1.text = ''
  ready2.text = ''
  readyBar1.beginFill(0x000000)
  readyBar1.drawRect(0, 0, renderer.width / 2, renderer.height)
  readyBar1.endFill()
  readyBar1.position.set(0, 0)
  readyBar2.beginFill(0x000000)
  readyBar2.drawRect(0, 0, renderer.width / 2, renderer.height)
  readyBar2.endFill()
  readyBar2.position.set(renderer.width / 2, 0)
}

function setInfo (text) {
  info.text = text
  info.position.set(renderer.width / 2 - info.width / 2, GAME.topPadding)
}

function getURLRoom () {
  var room = window.location.href.split('/').pop()
  if (room !== '') {
    return room
  } else {
    return null
  }
}

function resizeInterface (event) {
  var ratio = Math.min(window.innerWidth / 800, window.innerHeight / 600)
  var newWidth = Math.ceil(800 * ratio)
  var newHeight = Math.ceil(600 * ratio)
  renderer.view.style.width = newWidth + 'px'
  renderer.view.style.height = newHeight + 'px'
}

function startMatch () {
  gameStatus = 'playing'
  unReady()
  setInfo('3')
  setTimeout(() => {
    setInfo('2')
  }, 800)
  setTimeout(() => {
    setInfo('1')
  }, 800 * 2)
  setTimeout(() => {
    setInfo('')
    ball.beginFill(0xFFFFFF)
    ball.drawRect(0, 0, GAME.ballSize(), GAME.ballSize())
    ball.endFill()
    ball.position.set(renderer.width / 2, renderer.height / 2 - ball.height / 2)
    ball.vx = -1
    ball.vy = 0
    ball.speed = 5
    stage.addChild(ball)
  }, 800 * 3)
}

function stopMatch () {
  unReady()
  ball.vx = 0
  ball.vy = 0
  ball.speed = 0
  setInfo('')
  score = [0, 0]
  scoreMsg[0].text = ''
  scoreMsg[1].text = ''
  stage.removeChild(ball)
}

function gameLoop () {
  global.requestAnimationFrame(gameLoop)
  rectangle.y += rectangle.vy
  rectangle2.y += rectangle2.vy
  var container = {
    x: 0,
    y: topBar.height,
    width: renderer.width,
    height: renderer.height - topBar.height
  }

  contain(rectangle, container)
  contain(rectangle2, container)
  if (gameStatus === 'playing') {
    horizontalMovement(ball, rectangle, rectangle2)
    verticalMovement(ball, topBar, bottomBar)
    checkScore()
    scoreMsg[0].text = score[0]
    scoreMsg[1].text = score[1]
    checkWin()
  }

  renderer.render(stage)
}

function checkScore () {
  if (player === 0 && ball.x < 0) {
    score[1] += 1
    resetBall(1)
  } else if (player === 1 && ball.x > renderer.width) {
    score[0] += 1
    resetBall(-1)
  }
}

function resetBall (vx) {
  console.log('Resetting ball...')
  ball.position.set((renderer.width / 2) - vx * 100, renderer.height / 2 - ball.height / 2)
  ball.vx = vx
  ball.vy = 0
  ball.speed = 0
  setTimeout(() => {
    ball.speed = 5
  }, 800)
}

function checkWin () {
  var player1 = score[0] === 5
  var player2 = score[1] === 5
  if (player1 || player2) {
    sendSync()
    stopMatch()
    gameStatus = 'readiness'
  }
  if (player1) {
    setInfo('Player 1 wins! Try again?')
  } else if (player2) {
    setInfo('Player 2 wins! Try again?')
  }
}

function start () {
  if (getURLRoom() !== null) {
    setup()
  } else {
    $('section#pregame').style.display = 'block'
  }
}

var button = $('button#join')
var form = $('form#roomForm')
button.onclick = pickRoom
form.onsubmit = pickRoom

function pickRoom (event) {
  event.preventDefault()
  var roomName = $('input#roomName').value
  if (roomName === '') {
    roomName = stringGen(8)
  }
  window.location.href = roomName
}

function stringGen (len) {
  var text = ' '
  var charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < len; i++) {
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

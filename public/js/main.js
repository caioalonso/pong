/* global io PIXI */
'use strict'

var socket = io()
socket.on('sync', data => {
  rectangle2.y = data.y
})

const Graphics = PIXI.Graphics
const Container = PIXI.Container
const Text = PIXI.Text

var renderer, stage, rectangle, rectangle2

function setup () {
  renderer = PIXI.autoDetectRenderer(256, 256)
  renderer.view.style.position = 'absolute'
  renderer.view.style.display = 'block'
  renderer.autoResize = true
  renderer.resize(window.innerWidth, window.innerHeight)

  document.body.appendChild(renderer.view)

  stage = new Container()

  var line = new Graphics()
  line.lineStyle(4, 0xFFFFFF, 0.2)
  line.moveTo(0, 0)
  line.lineTo(0, renderer.height)
  line.x = renderer.width / 2
  line.y = 0
  stage.addChild(line)

  var centerSpacing = 60
  var topPadding = 0

  var message, message2
  WebFont.load({
    custom: {
      families: ['FFF']
    },
    active: () => {
      message = new Text('0', {
        fontFamily: 'FFF',
        fontSize: '4vw',
        fill: 'white'
      })
      message.position.set(renderer.width / 2 + centerSpacing, topPadding)
      stage.addChild(message)

      message2 = new Text('0', {
        fontFamily: 'FFF',
        fontSize: '4vw',
        fill: 'white'
      })
      message2.position.set(renderer.width / 2 - message2.width - centerSpacing, topPadding)
      stage.addChild(message2)
    }
  })

  rectangle = new Graphics()
  rectangle.beginFill(0xFFFFFF)
  rectangle.drawRect(0, 0, 20, 200)
  rectangle.endFill()
  rectangle.position.set(0, 0)
  stage.addChild(rectangle)

  rectangle2 = new Graphics()
  rectangle2.beginFill(0xFFFFFF)
  rectangle2.drawRect(0, 0, 20, 200)
  rectangle2.endFill()
  rectangle2.position.set(renderer.width - rectangle2.width, 0)
  stage.addChild(rectangle2)

  rectangle.vy = 0

  var up = keyboard(38)
  var down = keyboard(40)

  up.press = () => { rectangle.vy = -7 }

  up.release = () => {
    if (!down.isDown) {
      rectangle.vy = 0
    }
  }

  down.press = () => { rectangle.vy = 7 }

  down.release = () => {
    if (!up.isDown) {
      rectangle.vy = 0
    }
  }

  setInterval(() => {
    var info = {y: rectangle.y}
    socket.json.emit('sync', info)
  }, 50)

  renderer.render(stage)
  gameLoop()
}

var collision

function gameLoop () {
  requestAnimationFrame(gameLoop)
  contain(rectangle, {x: 0, y: 0, width: renderer.width, height: renderer.height})
  rectangle.y += rectangle.vy
  renderer.render(stage)
}

setup()

window.onresize = function (event) {
  var w = window.innerWidth
  var h = window.innerHeight
  renderer.view.style.width = w + 'px'
  renderer.view.style.height = h + 'px'
  renderer.resize(w, h)
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

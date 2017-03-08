/* global io PIXI */
'use strict'

var socket = io()
socket.on('sync', data => {
  rectangle2.y = data.y
})

const Graphics = PIXI.Graphics
const Container = PIXI.Container
const Text = PIXI.Text

var renderer, stage, line, rectangle, rectangle2
var message, message2
var centerSpacing = 60
var topPadding = 0
var rectWidth = 10
var rectHeight = () => window.innerHeight / 10
var rectMargin = 20

function setup () {
  renderer = PIXI.autoDetectRenderer(256, 256)
  renderer.view.style.position = 'absolute'
  renderer.view.style.display = 'block'
  renderer.autoResize = true
  renderer.resize(window.innerWidth, window.innerHeight)

  document.body.appendChild(renderer.view)

  stage = new Container()

  line = new Graphics()
  line.lineStyle(4, 0x333333)
  stage.addChild(line)

  WebFont.load({
    custom: {
      families: ['FFF']
    },
    active: () => {
      message = new Text('0', {
        fontFamily: 'FFF',
        fontSize: '1em',
        fill: 'white'
      })
      stage.addChild(message)

      message2 = new Text('0', {
        fontFamily: 'FFF',
        fontSize: '1em',
        fill: 'white'
      })
      stage.addChild(message2)
      resizeInterface()
    }
  })

  rectangle = new Graphics()
  rectangle.beginFill(0xFFFFFF)
  rectangle.drawRect(0, 0, rectWidth, rectHeight())
  rectangle.endFill()
  rectangle.position.set(rectMargin, 0)
  stage.addChild(rectangle)

  rectangle2 = new Graphics()
  rectangle2.beginFill(0xFFFFFF)
  rectangle2.drawRect(0, 0, rectWidth, rectHeight())
  rectangle2.endFill()
  rectangle2.position.set(renderer.width - rectangle2.width - rectMargin, 0)
  stage.addChild(rectangle2)


  setInterval(() => {
    var info = {y: rectangle.y}
    socket.json.emit('sync', info)
  }, 50)

  renderer.render(stage)
  gameLoop()
}

function resizeInterface (event) {
  var w = window.innerWidth
  var h = window.innerHeight
  renderer.view.style.width = w + 'px'
  renderer.view.style.height = h + 'px'
  renderer.resize(w, h)

  line.moveTo(0, 0)
  line.lineTo(0, h)
  line.x = w / 2
  line.y = 0
  line.width = Math.ceil(w / 1000 + 1)

  message.style = new PIXI.TextStyle({
    fontFamily: 'FFF',
    fontSize: w/30 + 'px',
    fill: 'white'
  })
  message.position.set(renderer.width / 2 + centerSpacing, topPadding)
  message2.style = new PIXI.TextStyle({
    fontFamily: 'FFF',
    fontSize: w/30 + 'px',
    fill: 'white'
  })
  message2.position.set(renderer.width / 2 - message2.width - centerSpacing, topPadding)

  rectangle.height = rectHeight()
  rectangle2.height = rectHeight()
}

var collision

function gameLoop () {
  requestAnimationFrame(gameLoop)
  rectangle.y = renderer.plugins.interaction.mouse.global.y
  contain(rectangle, {x: 0, y: 0, width: renderer.width, height: renderer.height})
  renderer.render(stage)
}

setup()

window.onresize = resizeInterface

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

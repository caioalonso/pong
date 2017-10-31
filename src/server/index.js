'use strict'

import express from 'express'
import http from 'http'
import socketio from 'socket.io'

import renderApp from './render-app'
import { APP_NAME, STATIC_PATH, WEB_PORT, LATENCY } from '../shared/config'
import { isProd } from '../shared/util'

const app = express()
const server = http.createServer(app)
const io = socketio(server)

server.listen(WEB_PORT, () => {
  console.log(`${APP_NAME} running on port ${WEB_PORT} ${isProd ? '(production)' :
  '(development).\nKeep "yarn dev:wds" running in an other terminal'}.`)
})
app.use(STATIC_PATH, express.static('dist'))
app.use(STATIC_PATH, express.static('public'))
app.get('/:room?', (req, res) => res.send(renderApp(APP_NAME)))

var rooms = {}

io.on('connection', socket => {
  var currentRoom

  socket.on('room', room => {
    rooms[room] = { ready: 0 }
    socket.join(room)
    currentRoom = room

    io.in(currentRoom).clients((error, clients) => {
      if (error) throw error

      io.to(currentRoom).emit('joined', {
        joined: socket.id,
        clients: clients
      })
    })
  })

  socket.on('disconnecting', () => {
    Object.keys(socket.rooms).forEach((room) => {
      socket.to(room).emit('disconnected', socket.id)
    })
  })

  socket.on('ready', msg => {
    socket.to(currentRoom).emit('ready')
    rooms[currentRoom].ready += 1
    if (rooms[currentRoom].ready == 2) {
      io.to(currentRoom).emit('start')
      rooms[currentRoom].ready = 0
    }
  })

  socket.on('sync', msg => {
    setTimeout(() => {
      socket.to(currentRoom).emit('sync', msg)
    }, LATENCY)
  })
})


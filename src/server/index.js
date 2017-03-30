'use strict'

import express from 'express'
import path from 'path'
import http from 'http'
import socketio from 'socket.io'

import renderApp from './render-app'
import { APP_NAME, STATIC_PATH, WEB_PORT } from '../shared/config'
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

io.on('connection', socket => {
  var currentRoom
  socket.on('room', room => {
    socket.join(room)
    currentRoom = room
  })
  socket.on('sync', msg => socket.in(currentRoom).emit('sync', msg))
})

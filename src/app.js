'use strict'

var express = require('express')
var path = require('path')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)

server.listen(3000)
app.use(express.static('public'))
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')))

io.on('connection', (socket) => {
  socket.on('sync', function(msg) {
    socket.broadcast.emit('sync', msg)
  });
})

'use strict';

var nodeStatic = require('node-static');
var nodeStaticServer = new nodeStatic.Server('./static', {cache: false});

var app = require('http').createServer(serverCallback).listen(8888);

function serverCallback(request, response) {
  request.addListener('end', function() {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    nodeStaticServer.serve(request, response);
  }).resume();
}

var socketIO = require('socket.io');
var io = socketIO.listen(app, {
  origins: '*:*',
  transports: ['polling', 'websocket']
});

io.sockets.on('connection', function(socket) {

  socket.on('join room', function(room) {
    var numClients = 0;
    if (io.sockets.adapter.rooms[room]) { // if room exists
      numClients = io.sockets.adapter.rooms[room].length;
    }

    if (numClients === 0) { // add first socket
      socket.join(room);
      socket.emit('joined', room, socket.id);
    } else if (numClients === 1) { // add second socket
      socket.join(room);
      socket.emit('joined', room, socket.id);
    } else { // max two sockets per room
      socket.emit('full', room);
    }

    log('Room ' + room + ' has ' + io.sockets.adapter.rooms[room].length + ' client(s)');
  });

  socket.on('message', function(data) {
    socket.broadcast.emit('message', data.data);
  });

  socket.on('disconnect', function() {
    // TODO: handle disconnect
  });

  /* function to log server messages on the client */
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }
});

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 23795;

app.use(require('./routes'));

const server = app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is listening on port ${PORT}`);
});

const io = require('socket.io')(server);

io.on('connect', (socket) => {
  socket.on('log', (text) => {
    console.log('Log:', text);
    socket.emit('log', Date.now());
  });
});

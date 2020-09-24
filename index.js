const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 23795;
const User = require('./models/User');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGOURI);

const db = mongoose.connection;
db.on('error', console.error.bind(console));
db.on('open', console.log.bind(console, 'Database connection has been opened'));

app.use(require('./routes'));

const server = app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is listening on port ${PORT}`);
});

const io = require('socket.io')(server);

io.on('connect', (socket) => {
  require('./sockets')(socket);
});

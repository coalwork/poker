const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

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
db.on('open', console.log.bind(console, 'Database connection has been opened.'));

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
  socket.on('register', async (userData) => {
    const validation = validateUser(userData);

    if (!validation.valid) { return socket.emit('register', validation.reason); }

    const user = new User({
      username: userData.username,
      password: await bcrypt.hash(userData.password, 10)
    });

    if ((await User.find({})).map(({ username }) => username).includes(userData.username)) {
      return socket.emit('register', `User ${userData.username} has already been registered.`);
    }

    try { await user.save(); }
    catch(error) {
      console.error(error);
      socket.emit('register', `An error occured in the server: ${error.message}`);
    }

    console.log(`User ${userData.username} has been created.`);
    socket.emit('register', `User '${userData.username}' has been created.`);
  });
});

function validateUser({ username = '', password = '' }) {
  username = username.replace(/^"/, '').replace(/"$/, '');

  let reason;
  switch (true) {
    case username.length === 0:
      reason = 'Username must be present.';
      break;
    case username.replace(/\s/g).length === 0:
      reason = 'Username may not only contain whitespace.';
      break;
    case username.length < 3:
      reason = 'Username may not be shorter than 3 characters.';
      break;
    case username.length > 16:
      reason = 'Username may not exceed 16 characters.';
      break;
    case password.length === 0:
      reason = 'Password must be present.';
      break;
    case password.length > 128:
      reason = 'Password may not exceed 128 characters.'
      break;
    default:
      return { valid: true };
  }
  return { valid: false, reason };
}

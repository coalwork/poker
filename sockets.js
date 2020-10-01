const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const { validateUser } = require('./funcs');

// This stuff is probably self-explanatory
module.exports = function socketListeners(socket) {
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

  socket.on('users', async () => {
    socket.emit('users', await User.find({}).then((users) => users.map(({ username }) => username)))
  });
};

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    min: 3,
    max: 16,
    required: true,
    unique: true
  },
  password: {
    type: String,
    max: 128,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);

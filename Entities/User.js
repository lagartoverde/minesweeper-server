const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String, 
    required: true
  },
  registered: {
    type: Boolean,
    default: false,
  },
  hash: String,
  lvl: {
    type: Number,
    default: 1
  },
  totalExp: {
    type: Number,
    default: 0
  },
  lvlExp: {
    type: Number,
    default: 0
  }
})

mongoose.model('User', UserSchema)

module.exports = mongoose.model('User')
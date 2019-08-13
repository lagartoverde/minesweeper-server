const mongoose = require('mongoose')

const GameSchema = new mongoose.Schema({
  board: Array,
  boardState: Array,
  mode: {
    type: String,
    required: true
  },
  finished: {
    type: Boolean,
    default: false
  },
  won: {
    type: Boolean,
    default: undefined
  },
  cellsOpened: {
    type: Number,
    default: 0
  },
  started: {
    type: Date,
    required: true
  },
  finishedTime: {
    type: Date
  },
  mines: Number,
  flagsRemaining: Number
})

mongoose.model('Game', GameSchema)

module.exports = mongoose.model('Game')
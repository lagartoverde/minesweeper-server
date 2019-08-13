const mongoose = require('mongoose')
const Game = require('./Game')

const MultiplayerGameSchema = new mongoose.Schema({
  gamePlayerOne: Game.schema,
  gamePlayerTwo: Game.schema
})

mongoose.model('MultiplayerGame', MultiplayerGameSchema)

module.exports = mongoose.model('MultiplayerGame')
const mongoose = require('mongoose')

const ScoreSchema = new mongoose.Schema({
  username: String,
  seconds: Number,
  mode: String
})

mongoose.model('Score', ScoreSchema)

module.exports = mongoose.model('Score')
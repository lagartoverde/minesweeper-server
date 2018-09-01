const mongoose = require('mongoose')

const ScoreSchema = new mongoose.Schema({
  name: String,
  seconds: Number,
  mode: String
})

mongoose.model('Score', ScoreSchema)

module.exports = mongoose.model('Score')
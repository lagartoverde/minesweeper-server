const express = require('express')
const app = express()
const bodyParser = require('body-parser')

require('./database')
const Score = require('./Entities/Score')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/getLeaderBoard', (req, res) => {
  let callbacks = 0
  let response = {}
  Score.find({mode: 'easy'}, (err,scores) => {
    response.easy = scores
    callbacks++;
    if(callbacks === 3) res.json(response)
  })
  Score.find({mode: 'medium'}, (err,scores) => {
    response.medium = scores
    callbacks++;
    if(callbacks === 3) res.json(response)
  })
  Score.find({mode: 'hard'}, (err,scores) => {
    response.hard = scores
    callbacks++;
    if(callbacks === 3) res.json(response)
  })
})

app.post('/newScore', (req,res) => {
  const { name, seconds, mode } = req.body
  Score.create({ name, seconds, mode })
    .then(() => res.json({success: true}))
    .catch((err) => res.json({success: false, message: err}))
})

app.listen('9000', () => {
  console.log('server is listening on port 9000')
})
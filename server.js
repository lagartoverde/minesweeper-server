const express = require('express')
const app = express()
const bodyParser = require('body-parser')

require('./database')
const Score = require('./Entities/Score')

const port = process.env.PORT || 9000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req,res) => {
  res.end('Hello World!')
})

app.get('/getLeaderboard', (req, res) => {
  let callbacks = 0
  let response = {}
  Score.find({mode: 'easy'},null,{ skip:0, limit:10, sort:{ seconds: 1 }}, (err,scores) => {
    response.easy = scores
    callbacks++;
    if(callbacks === 3) res.json(response)
  }).catch(console.log)
  Score.find({mode: 'medium'},null,{ skip:0, limit:10, sort:{ seconds: 1 }}, (err,scores) => {
    response.medium = scores
    callbacks++;
    if(callbacks === 3) res.json(response)
  })
  Score.find({mode: 'hard'},null,{ skip:0, limit:10, sort:{ seconds: 1 }}, (err,scores) => {
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

app.listen(port, () => {
  console.log('server is listening on port 9000')
})
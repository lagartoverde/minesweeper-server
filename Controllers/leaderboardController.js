const express = require('express')
const router = express.Router()

const Score = require('../Entities/Score')


router.get('/', (req, res) => {
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

module.exports = router
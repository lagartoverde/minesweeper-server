const express = require('express')
const router = express.Router()

const Game = require('../Entities/Game')
const Score = require('../Entities/Score')
const {createNewGame, openCell, flagCell} = require('../util/gameUtilities')
const {giveExp, submitScore} = require('../util/userUtilities')



router.post('/new', (req, res) => {
  const { mode } = req.body
  const game = createNewGame(mode)
  Game.create(game)
    .then((game) => {
      res.json({id: game._id, board: game.boardState, started: game.started})
    })
})


router.post('/:id/open', (req, res) => {
  const {x, y} = req.body
  const {id} = req.params
  Game.findById(id, (err, game) => {
    if(err) console.log(err)
    else {
      openCell(game, {x, y})
      game.save().then((gameSaved) => {
        let response = {
          boardState: game.boardState,
          finished: game.finished,
          won: game.won,
          flagsRemaining: game.flagsRemaining
        }
        if(game.finished && req.user) {
          giveExp(game, req.user.id, (newPlayerInfo) => {
            response.playerInfo = newPlayerInfo;
            res.json(response)
          });
          if(game.won) {
            submitScore(game, req.user.id)
          }
        }else {
          res.json(response)
        } 
        
      })
    }
  })
})



router.post('/:id/flag', (req, res) => {
  const {x, y} = req.body
  const {id} = req.params
  Game.findById(id, (err, game) => {
    if(err) console.log(err)
    else {
      flagCell(game, {x, y})
      game.save().then((err) => {
        res.json({
          boardState: game.boardState,
          finished: game.finished,
          won: game.won,
          flagsRemaining: game.flagsRemaining
        })
      })
    }
  })
})


module.exports = router


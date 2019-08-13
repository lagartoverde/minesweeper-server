const {JwtSecret} = require('../keys')
const levels = require('./levels.json')
const jwt = require('jsonwebtoken')

const User = require('../Entities/User')
const Score = require('../Entities/Score')

function giveExp(game, userId, callback) {
  User.findById(userId, (err, user) => {
    if(err) {
      callback({})
    } else {
      let expWon = game.cellsOpened 
      if(game.won) {
        expWon *=10;
      }
      user.totalExp += expWon;
      user.lvlExp += expWon;
      if(user.lvlExp >= levels[user.lvl].lvlExp) {
        user.lvlExp = user.lvlExp -levels[user.lvl].lvlExp;
        user.lvl +=1;
      }
      user.save().then((userSaved) => {
        const playerInfo = generateUserInfo(userSaved)
        callback(playerInfo)
      })
    }
  })
}

function generateUserInfo(user) {
  const token= jwt.sign({ id: user._id}, JwtSecret)
  return {
    lvl: user.lvl,
    lvlExp: user.lvlExp,
    nextExp: levels[user.lvl].lvlExp,
    username: user.username,
    token
  }
}

function submitScore(game, userId) {
  const started = new Date(game.started)
  const finished = new Date(game.finishedTime)
  const diff = finished.getTime() - started.getTime();
  const diffSeconds = Math.floor(diff/1000);
  User.findById(userId, (err, user) => {
    if(err) {
      console.log(err)
    } else {
      const newScore = {
        username: user.username, 
        mode: game.mode, 
        seconds: diffSeconds
      };
      Score.findOne({username: newScore.username, mode: newScore.mode}, (err, oldScore) => {
        console.log(oldScore)
        console.log(newScore)
        if(err) {
          console.log(err)
        } else {
          if(!oldScore) {
            Score.create(newScore)
          } else if(oldScore.seconds > newScore.seconds) {
            oldScore.remove();
            Score.create(newScore);
          }
        }
      })
    }
  })
}

module.exports = {giveExp, generateUserInfo, submitScore}

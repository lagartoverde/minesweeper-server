const Game = require('../Entities/Game');
const MultiplayerGame = require('../Entities/MultiplayerGame')
const {createNewGame, openCell, flagCell} = require('../util/gameUtilities')
const {JwtSecret} = require('../keys')
const jwt = require('jsonwebtoken')

const mode = 'easy';

const User = require('../Entities/User')

function startMultiplayerGame(playerOne, playerTwo) {
  const gamePlayerOne = createNewGame(mode)
  const gamePlayerTwo = createNewGame(mode);
  MultiplayerGame.create({gamePlayerOne, gamePlayerTwo}).then(multiplayerGame => {
    const id = multiplayerGame._id;
    playerOne.emit('startGame', {playerBoard: multiplayerGame.gamePlayerOne.boardState, opponentBoard: multiplayerGame.gamePlayerTwo.boardState})
    playerTwo.emit('startGame', {playerBoard: multiplayerGame.gamePlayerTwo.boardState, opponentBoard: multiplayerGame.gamePlayerOne.boardState})
    playerOne.on('openCell', ({x,y})=> {
      MultiplayerGame.findById(id, (err, multiplayerGame) =>{
        openCell(multiplayerGame.gamePlayerOne, {x,y})
        checkMultiplayerWin(multiplayerGame, playerOne, playerTwo)
        multiplayerGame.save().then(gameSaved=> {
          playerOne.emit('updatePlayerBoard', gameSaved.gamePlayerOne.boardState)
          playerTwo.emit('updateOpponentBoard', gameSaved.gamePlayerOne.boardState)
        })
      })
      
    })
    playerTwo.on('openCell', ({x,y})=> {
      MultiplayerGame.findById(id, (err, multiplayerGame) =>{
        openCell(multiplayerGame.gamePlayerTwo, {x,y})
        checkMultiplayerWin(multiplayerGame, playerOne, playerTwo)
        multiplayerGame.save().then(gameSaved=> {
          playerTwo.emit('updatePlayerBoard', gameSaved.gamePlayerTwo.boardState)
          playerOne.emit('updateOpponentBoard', gameSaved.gamePlayerTwo.boardState)
        })
      })
    })
    playerOne.on('flagCell', ({x,y})=> {
      MultiplayerGame.findById(id, (err, multiplayerGame) =>{
        flagCell(multiplayerGame.gamePlayerOne, {x,y})
        multiplayerGame.save().then(gameSaved=> {
          playerOne.emit('updatePlayerBoard', gameSaved.gamePlayerOne.boardState)
          playerTwo.emit('updateOpponentBoard', gameSaved.gamePlayerOne.boardState)
        })
      })
    })
    playerTwo.on('flagCell', ({x,y})=> {
      MultiplayerGame.findById(id, (err, multiplayerGame) =>{
        flagCell(multiplayerGame.gamePlayerTwo, {x,y})
        multiplayerGame.save().then(gameSaved=> {
          playerTwo.emit('updatePlayerBoard', gameSaved.gamePlayerTwo.boardState)
          playerOne.emit('updateOpponentBoard', gameSaved.gamePlayerTwo.boardState)
        })
      })
    })

    let connectionTimeOut;
    playerOne.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        playerOne.connect();
      } 
      // else the socket will automatically try to reconnect
      connectionTimeOut = setTimeout(() => {
        timeoutGame(id, playerTwo, playerOne)
      }, 10000)
    });

    playerTwo.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        playerTwo.connect();
      } 
      // else the socket will automatically try to reconnect
      connectionTimeOut = setTimeout(() => {
        timeoutGame(id, playerOne, playerTwo)
      }, 10000)
    });

    playerOne.on('reconnect', () => {
      clearTimeout(connectionTimeOut)
    })

    playerTwo.on('reconnect', () => {
      clearTimeout(connectionTimeOut)
    })

    playerOne.on('loggedPlayer', (token) => {
      getPlayerinfo(token, (playerInfo) => {
        playerTwo.emit('opponentInfo', playerInfo)
      }) 
    })
    playerTwo.on('loggedPlayer', (token) => {
      getPlayerinfo(token, (playerInfo) => {
        playerOne.emit('opponentInfo', playerInfo)
      }) 
    })

    playerOne.on('unloggedPlayer', () => {
      playerTwo.emit('opponentInfo', {username: 'Anonymous'})
    })

    playerTwo.on('unloggedPlayer', () => {
      playerOne.emit('opponentInfo', {username: 'Anonymous'})
    })

  })

}

function checkMultiplayerWin(multiplayerGame, playerOne, playerTwo) {
  const {gamePlayerOne, gamePlayerTwo} = multiplayerGame
  if(gamePlayerOne.finished && gamePlayerTwo.finished) {
    if(gamePlayerOne.won && gamePlayerTwo.won) {
      const finishOne = new Date(gamePlayerOne.finishedTime);
      const finishTwo = new Date(gamePlayerTwo.finishedTime);
      if(finishOne.getTime() < finishTwo.getTime()) {
        playerWins(playerOne,playerTwo)
      } else {
        playerWins(playerTwo, playerOne)
      }
    } else if(gamePlayerOne.won) {
      playerWins(playerOne,playerTwo)
    } else if(gamePlayerTwo.won) {
      playerWins(playerTwo, playerOne)
    } else {
      if(gamePlayerOne.cellsOpened > gamePlayerTwo.cellsOpened) {
        playerWins(playerOne,playerTwo)
      } else {
        playerWins(playerTwo, playerOne)
      }
    }
  } else {
    return
  }
}


function playerWins(winnerPlayer, loserPlayer) {
  winnerPlayer.emit('gameFinished', {victory: true})
  loserPlayer.emit('gameFinished', {victory: false})
}

function timeoutGame(id, winnerPlayer, loserPlayer) {
  MultiplayerGame.findById(id, (err, multiplayerGame) =>{
    multiplayerGame.gamePlayerOne.finished = true;
    multiplayerGame.gamePlayerTwo.finished = true;
    multiplayerGame.save().then(() => {
      playerWins(winnerPlayer, loserPlayer)
    })
  })
}


function getPlayerinfo(token, cb) {
  jwt.verify(token, JwtSecret, (err,decoded) => {
    if(err) {
      console.log(err)
      cb({username: 'Anonymous'})
    } else {
      User.findById(decoded.id, (err, user) => {
        if(err) {
          console.log(err)
          cb({username: 'Anonymous'})
        } else {
          cb({
            username: user.username,
            lvl: user.lvl
          })
        }
      })
    }
  })
}


module.exports = startMultiplayerGame
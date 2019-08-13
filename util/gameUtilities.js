const gameModes = {
  easy: {
    size: 10,
    mines: 10
  },
  medium: {
    size: 20,
    mines: 50
  },
  hard: {
    size: 30,
    mines: 100
  },
}

const User = require('../Entities/User')
const levels = require('./levels.json')

function createNewGame(mode) {
  const game = {mode, started: new Date()}
  generateGameboard(game)
  poblateGameboard(game)
  checkSurroundings(game)
  return game;
}

function generateGameboard(game) {
  const size = gameModes[game.mode].size
  const arrayBoard = [];
  const arrayOpened = [];
  for (let i = 0; i < size; i++) {
    const innerArrayBoard = [];
    const innerArrayOpened = [];
    for (let j = 0; j < size; j++) {
      innerArrayBoard.push(0);
      innerArrayOpened.push('?');
    }
    arrayBoard.push(innerArrayBoard);
    arrayOpened.push(innerArrayOpened);
  }
  game.board = arrayBoard;
  game.boardState = arrayOpened;
  game.finished = false;
  return game;
}

function poblateGameboard(game) {
  const mines = gameModes[game.mode].mines
  const size = gameModes[game.mode].size
  for (let i = 0; i < mines; i++) {
    let placed = false;
    while (!placed) {
      let x = Math.floor(Math.random() * (size - 1));
      let y = Math.floor(Math.random() * (size - 1));
      if (game.board[x][y] !== "X") {
        game.board[x][y] = "X";
        placed = true;
      }
    }
  }
  game.mines = mines
  game.flagsRemaining = mines;
  return game
}

function checkSurroundings(game) {
  const size = gameModes[game.mode].size
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (game.board[i][j] === "X") continue;
      let minesAround = 0;
      if (i > 0 && game.board[i-1][j] === "X") minesAround++;
      if (i < size - 1 && game.board[i+1][j] === "X") minesAround++;
      if (j > 0 && game.board[i][j-1] === "X") minesAround++;
      if (j < size - 1 && game.board[i][j+1] === "X") minesAround++;
      if (i > 0 && j > 0 && game.board[i-1][j-1] === "X") minesAround++;
      if (i < size - 1 && j < size - 1 && game.board[i+1][j+1] === "X") minesAround++;
      if (i > 0 && j < size - 1 && game.board[i-1][j+1] === "X") minesAround++;
      if (i < size - 1 && j > 0 && game.board[i+1][j-1] === "X") minesAround++;
      game.board[i][j] = '' + minesAround
    }
  }
}

function openCell(game,{x, y}) {
  if(game.finished) return
  if(game.boardState[x][y] != '?') return;
  game.boardState[x][y] = game.board[x][y];
  game.markModified(`boardState.${x}.${y}`);
  if(game.board[x][y] === 'X'){
    game.finished = true;
    game.won = false;
    game.finishedTime = new Date();
    return;
  } else if(game.board[x][y] == 0) {
    openSurroundings(game, {x, y})
  }
  const mines = gameModes[game.mode].mines
  const size = gameModes[game.mode].size
  game.cellsOpened ++;
  if(game.cellsOpened === (size * size) - mines){
    game.finished = true;
    game.won = true;
    game.finishedTime = new Date();
  }
}

function openSurroundings(game, {x, y}) {
  const maxIndex = gameModes[game.mode].size - 1;
  if(x > 0) openCell(game, { x: x-1, y });
  if(x < maxIndex) openCell(game, { x: +x+1, y });
  if(y > 0) openCell(game, { x, y: y-1 });
  if(y < maxIndex) openCell(game, { x, y: +y+1 });
  if(x > 0 && y > 0) openCell(game, { x: x-1, y: y-1 });
  if(x < maxIndex && y > 0) openCell(game, { x: +x+1, y: y-1 });
  if(x > 0 && y < maxIndex) openCell(game, { x: x-1, y: +y+1 });
  if(x < maxIndex && y < maxIndex) openCell(game, { x: +x+1, y: +y+1 });
}

function flagCell(game, {x, y}) {
  if(game.finished) return
  if(game.boardState[x][y] != '?' && game.boardState[x][y] != 'F') return;
  if(game.boardState[x][y] == 'F') {
    game.boardState[x][y] = '?';
    game.markModified(`boardState.${x}.${y}`);
    game.flagsRemaining ++
  } else {
    if(game.flagsRemaining == 0) return
    game.boardState[x][y] = 'F';
    game.markModified(`boardState.${x}.${y}`);
    game.flagsRemaining --
  }

  return game;
  
}



module.exports = {createNewGame, openCell, flagCell}

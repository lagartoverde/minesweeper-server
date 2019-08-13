const express = require('express')
const app = express()
var server = require('http').Server(app);
var io = require('socket.io')(server);
const bodyParser = require('body-parser')
const {JwtSecret} = require('./keys')
const jwt = require('jsonwebtoken')
const cors = require('cors');

require('./database')

const User = require('./Entities/User')

const leaderboardController = require('./Controllers/leaderboardController');
const gameController = require('./Controllers/gameController');
const startMultiplayerGame = require('./Controllers/multiplayerGameController');

const {generateUserInfo} = require('./util/userUtilities');

const port = 9000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use((req,res,next) => {
  if(req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jwt.verify(req.headers.authorization.split(' ')[1],JwtSecret, (err,decode) => {
      if(err) {
        console.log(err);
        req.user = undefined;
      } else {
        req.user = decode;
        next();
      }
    })
  } else {
    req.user = undefined;
    next();
  }
})

app.get('/', (req,res) => {
  res.end('Hello World!')
})

app.use('/leaderboard', leaderboardController);

app.use('/game', gameController)


// Multiplayer logic
const UnconnectedPlayerStack = []

io.on('connection', socket => {
  let handled = false
  while(!handled){
    if(UnconnectedPlayerStack.length === 0) {
      UnconnectedPlayerStack.push(socket)
      handled = true;
    } else {
      const playerOne = UnconnectedPlayerStack.pop();
      if(!playerOne.connected || playerOne.disconnected) continue;
      const playerTwo = socket;
      startMultiplayerGame(playerOne, playerTwo)
      handled = true;
    }
  }
})


//Authentication

app.post('/login', (req,res) => {
  const {username} = req.body;
  User.find({username}, (err, users) => {
    if(users && users.length==1) {
      res.json(generateUserInfo(users[0]))
    } else {
      User.create({username}).then(user =>{
        res.json(generateUserInfo(user))
      })
    }
  })
})





server.listen(port, () => {
  console.log('server is listening on port 9000')
})
const mongoose = require('mongoose')
const keys = require('./keys') 

mongoose.connect(keys.mongoDbUrl)
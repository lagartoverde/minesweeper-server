const mongoose = require('mongoose')
const {mongoDbUrl} = require('./keys') 

mongoose.connect(mongoDbUrl)
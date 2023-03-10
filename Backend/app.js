require ('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')

const saucesRoutes = require('./routes/sauces')
const userRoutes = require('./routes/user')


// import mongoDB
const password = process.env.DB_PASSWORD
const userName= process.env.DB_USER
mongoose.connect(`mongodb+srv://${userName}:${password}@cluster0.pgngyif.mongodb.net/?retryWrites=true&w=majority`,
{ useNewUrlParser: true,
useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'))

    
    
const app = express()

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    next()
})

app.use(bodyParser.json())

app.use('/api/sauces', saucesRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname,'images')))

module.exports = app
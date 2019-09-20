const express = require('express')
const path = require('path')
const opn = require('opn')

const app = express()

const viewsDir = path.join(__dirname, 'views')

app.use(express.static(viewsDir))
app.use(express.static(path.join(__dirname, './static')))
app.use(express.static(path.join(__dirname, './node_modules/face-api.js/dist')))

app.get('/', (req, res) => res.redirect('/welcome'))
app.get('/welcome', (req, res) => res.sendFile(path.join(viewsDir, 'welcome.html')))
app.get('/kick.wav', (req, res) => res.sendFile(path.join(__dirname, './static/sounds/kick.wav')))

app.get('/training', (req, res) => res.sendFile(path.join(viewsDir, 'training.html')))

app.get('/comment', (req, res) => res.sendFile(path.join(viewsDir, 'comment.html')))
app.get('/minority', (req, res) => res.sendFile(path.join(viewsDir, 'minority.html')))

app.get('/pose', (req, res) => res.sendFile(path.join(viewsDir, 'pose.html')))

app.get('/face-detection', (req, res) => res.sendFile(path.join(viewsDir, 'face-detection.html')))
app.get('/face-landmarks', (req, res) => res.sendFile(path.join(viewsDir, 'face-landmarks.html')))
app.get('/face-expression', (req, res) => res.sendFile(path.join(viewsDir, 'face-expression.html')))
app.get('/face-age_and_gender', (req, res) => res.sendFile(path.join(viewsDir, 'face-age_and_gender.html')))



app.listen(3001, () => console.log('Your app is available at http://localhost:3001'))
opn('http://localhost:3001');
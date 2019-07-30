const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const request = require('request-promise');

const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const Filter = require('bad-words')


const port = process.env.PORT || 4000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.emit('message', generateMessage('Welcome'))
    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', generateMessage('New user has joined'))

    
    socket.on('sendMessage', async (message, callback) => {
        const filter = new Filter()
        const options = {
            url: 'http://127.0.0.1:8000/spamorham',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'my-reddit-client',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: message })
        };

        request(options, function (err, res, body) {
            var response = JSON.parse(body)["prediction"][0];
            console.log(response)
            if (filter.isProfane(message)) {
                return callback('Profanity is not allowed!')
            }
            
            if(response === 'spam')
                return callback('Spam is not allowed!')
            
                io.emit('message', generateMessage(message))
            callback()
        })
    })

    socket.on('sendLocation', (coords, callback) => {
        const location = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
        io.emit('locationMessage', generateLocationMessage(location))
        callback();
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('User has disconnected'))
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
const socket = io()

var $messageForm = document.querySelector('#message-form')
var $messageFormInput = $messageForm.querySelector('input')
var $messageFormButton = $messageForm.querySelector('button')
var $sendLocationButton = document.querySelector('#send-location')
var $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, 
        {
            message : message.text,
            createdAt : moment(message.createdAt).format('h:mm A')
        })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, 
        {
            url : url.link,
            createdAt : moment(url.createdAt).format('h:mm A')
        })
    $messages.insertAdjacentHTML('beforeend', html)
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
       
        if(error)
        {
            return console.log(error)
        }
        console.log('Message Delievered!')
    }
    )
})

$sendLocationButton.addEventListener('click', () => {

    if  (!navigator.geolocation){
        return alert('Geolocation not supported')
    }


    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        socket.emit('sendLocation', {
            latitude: latitude,
            longitude: longitude
        }, (error) => {
            $sendLocationButton.removeAttribute('disabled')
            if(error)
            {
                return console.log(error)
            }
            else
            console.log('Location has been shared!')
        })
    })
})
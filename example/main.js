const INSTANCE_LOCATOR = 'YOUR_INSTANCE_LOCATOR'
const TOKEN_PROVIDER_URL = 'YOUR_TOKEN_PROVIDER_URL'
const USER_ID = 'YOUR_USER_ID'

let currentUser
let room

const tokenProvider = new Chatkit.TokenProvider({
  url: TOKEN_PROVIDER_URL
})

const chatManager = new Chatkit.ChatManager({
  instanceLocator: INSTANCE_LOCATOR,
  tokenProvider: tokenProvider,
  userId: USER_ID
})

chatManager.connect()
  .then(cUser => {
    currentUser = cUser
    const roomToSubscribeTo = currentUser.rooms[0]

    if (roomToSubscribeTo) {
      room = roomToSubscribeTo
      console.log('Going to subscribe to', roomToSubscribeTo)
      currentUser.subscribeToRoom(
        roomToSubscribeTo.id,
        {
          onNewMessage: message => {
            console.log('new message:', message)
            const messagesList = document.getElementById('messages')
            const messageItem = document.createElement('li')
            messageItem.className = 'message'
            messagesList.append(messageItem)
            const textDiv = document.createElement('div')
            textDiv.innerHTML = `${message.sender.name}: ${message.text}`
            messageItem.appendChild(textDiv)

            if (message.attachment) {
              let attachment
              switch (message.attachment.type) {
                case 'image':
                  attachment = document.createElement('img')
                  break
                case 'video':
                  attachment = document.createElement('video')
                  attachment.controls = 'controls'
                  break
                case 'audio':
                  attachment = document.createElement('audio')
                  attachment.controls = 'controls'
                  break
                default:
                  break
              }

              attachment.className += ' attachment'
              attachment.width = '400'

              if (message.attachment.fetchRequired) {
                currentUser.fetchAttachment(message.attachment.link)
                  .then(fetchedAttachment => {
                    attachment.src = fetchedAttachment.link
                    messageItem.appendChild(attachment)
                  })
                  .catch(error => {
                    console.log('Error', error)
                  })
              } else {
                attachment.src = message.attachment.link
                messageItem.appendChild(attachment)
              }
            }
          }
        }
      )
    } else {
      console.log('No room to subscribe to')
    }
    console.log('Successful connection', currentUser)
  })
  .catch(err => {
    console.log('Error on connection: ', err)
  })

document.getElementById('send-button').addEventListener('click', ev => {
  const fileInput = document.querySelector('input[name=testfile]')
  const textInput = document.getElementById('text-input')

  currentUser.sendMessage({
    text: textInput.value,
    roomId: room.id,
    // attachment: {
    //   link: 'https://assets.zeit.co/image/upload/front/api/deployment-state.png',
    //   type: 'image',
    // },
    attachment: fileInput.value
      ? {
        file: fileInput.files[0],
        // Split on slashes, remove whitespace
        name: fileInput.value.split(/(\\|\/)/g).pop().replace(/\s+/g, ''),
      }
      : undefined,
  })
    .then(messageId => {
      console.log('Success!', messageId)
      fileInput.value = ''
      textInput.value = ''
    })
    .catch(error => {
      console.log('Error', error)
    })
})

document.querySelector('.choose-file').addEventListener('click', () => {
  document.querySelector('input[name=testfile]').click()
})

const INSTANCE_LOCATOR = "v1:us1:7b86e31f-4d7d-44a1-952d-628a682b48ec"
const TOKEN_PROVIDER_URL =
  "https://us1.pusherplatform.io/services/chatkit_token_provider/v1/7b86e31f-4d7d-44a1-952d-628a682b48ec/token"
const USER_ID = "alice"

let currentUser
let room

const tokenProvider = new Chatkit.TokenProvider({
  url: TOKEN_PROVIDER_URL,
})

const noopLogger = (...items) => {}

const chatManager = new Chatkit.ChatManager({
  instanceLocator: INSTANCE_LOCATOR,
  tokenProvider: tokenProvider,
  userId: USER_ID,
  logger: {
    info: console.log,
    warn: console.log,
    error: console.log,
    debug: console.log,
    verbose: console.log,
  },
})

chatManager
  .connect({
    onAddedToRoom: room => {
      console.log("added to room: ", room)
    },
    onRemovedFromRoom: room => {
      console.log("removed from room: ", room)
    },
    onUserJoinedRoom: (room, user) => {
      console.log("user: ", user, " joined room: ", room)
    },
    onUserLeftRoom: (room, user) => {
      console.log("user: ", user, " left room: ", room)
    },
    onPresenceChanged: ({ previous, current }, user) => {
      console.log("user: ", user, " was ", previous, " but is now ", current)
    },
  })
  .then(cUser => {
    window.navigator.serviceWorker
      .register("/example/service-worker.js")
      .then(registration =>
        cUser
          .enablePushNotifications({
            serviceWorkerRegistration: registration,
          })
          .then(() => {
            console.log("Push notifications enabled")
          })
          .catch(err => {
            console.error("Push notifications not enabled", err)
          }),
      )

    currentUser = cUser
    window.currentUser = cUser
    const roomToSubscribeTo = currentUser.rooms[0]

    if (roomToSubscribeTo) {
      room = roomToSubscribeTo
      console.log("Going to subscribe to", roomToSubscribeTo)
      currentUser.subscribeToRoom({
        roomId: roomToSubscribeTo.id,
        hooks: {
          onMessage: message => {
            console.log("new message:", message)
            const messagesList = document.getElementById("messages")
            const messageItem = document.createElement("li")
            messageItem.className = "message"
            messagesList.append(messageItem)
            const textDiv = document.createElement("div")
            textDiv.innerHTML = `${message.sender.name}: ${message.text}`
            messageItem.appendChild(textDiv)

            if (message.attachment) {
              let attachment
              switch (message.attachment.type) {
                case "image":
                  attachment = document.createElement("img")
                  break
                case "video":
                  attachment = document.createElement("video")
                  attachment.controls = "controls"
                  break
                case "audio":
                  attachment = document.createElement("audio")
                  attachment.controls = "controls"
                  break
                default:
                  break
              }

              attachment.className += " attachment"
              attachment.width = "400"
              attachment.src = message.attachment.link
              messageItem.appendChild(attachment)
            }
          },
        },
      })
    } else {
      console.log("No room to subscribe to")
    }
    console.log("Successful connection", currentUser)
  })
  .catch(err => {
    console.log("Error on connection: ", err)
  })

document.getElementById("send-button").addEventListener("click", ev => {
  const fileInput = document.querySelector("input[name=testfile]")
  const textInput = document.getElementById("text-input")

  currentUser
    .sendMessage({
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
            name: fileInput.value
              .split(/(\\|\/)/g)
              .pop()
              .replace(/\s+/g, ""),
          }
        : undefined,
    })
    .then(messageId => {
      console.log("Success!", messageId)
      fileInput.value = ""
      textInput.value = ""
    })
    .catch(error => {
      console.log("Error", error)
    })
})

document.querySelector(".choose-file").addEventListener("click", () => {
  document.querySelector("input[name=testfile]").click()
})

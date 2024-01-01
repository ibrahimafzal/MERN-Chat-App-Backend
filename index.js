const express = require("express")
const mongoose = require("mongoose")
const app = express()
const userRoutes = require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const messageRoutes = require("./routes/messageRoutes")
const cors = require("cors")
const path = require('path')

require("dotenv").config()
app.use(express.json())
app.use(cors())

// MONGO DB
const MONGO_URL = process.env.MONGO_URL
const connectDb = async () => {
    try {
        const connect = await mongoose.connect(MONGO_URL)
        console.log("MongoDB connected Successfully")
    } catch (error) {
        console.log(error)
    }
}


connectDb()

// Routes
app.use("/user", userRoutes)
app.use("/chat", chatRoutes)
app.use("/message", messageRoutes)

//  ----------------- Deployement -----------------//

// const __dirname1 = path.resolve();
// if(process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname1, '../frontend/build')))

//     app.get("*", (req,res) => {
//         res.sendFile(path.resolve(__dirname1, "../frontend", "build", "index.html"))
//     })
// } else {
//     res.send("API is running successfully")
// }

//  ----------------- Deployement -----------------//



// Server Listen
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
    console.log("Server is Running...")
})

const io = require("socket.io")(server, {
    cors: {
        origin: "*"
    },
    pingTimeout: 60000
})

io.on("connection", (socket) => {
    console.log("Socket.io Connection established")
    
    socket.on("setup", (userData) => {
        socket.join(userData._id)
        socket.emit("connected")
    })

    socket.on("join chat", (room) => {
        socket.join(room)
    })

    socket.on("typing", (room) => socket.in(room).emit("typing"))
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved?.chat
        if(!chat.users) {
            return console.log("chat.users not defined")
        }
        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;
    
            socket.in(user._id).emit("message recieved", newMessageRecieved)
        })
    })

    socket.off("setup", () => {
        console.log("user disconnected")
        socket.leave(userData._id)
    })
})
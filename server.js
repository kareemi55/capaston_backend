const app = require("./app")
const PORT = process.env.port || 3001;
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin : "http://localhost:3000",
        methods : ["GET", "POST"]
    },
})

io.on("connection", (socket) =>{
    console.log(`User Connected : ${socket.id}`);

    socket.on("join_room", (data) =>{
        socket.join(data)
        console.log(`User with ID: ${socket.id} joined room : ${data}`)
    })

    socket.on("send_message", (data)=>{
        socket.to(data.room).emit("receive_message",data)
    })

    socket.on("disconnect", () =>{
        console.log("User Disconnected", socket.id)
    })
})

server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost/${PORT}`)
})
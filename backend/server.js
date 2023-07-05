const express = require("express");
const cookieParser = require("cookie-parser");
const rootRouter = require("./middleware/rootRouter");
const cors = require("cors");
const port = process.env.PORT;
require("./db/db");

const app = express();

// app.use(cors({
//   credentials: true,
//   origin: [process.env.APP_URL, "http://localhost:5173"]
// }))

app.use(express.json());
app.use(cookieParser());
app.use(rootRouter);



const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    credentials: true,
    origin: [process.env.APP_URL, "http://localhost:5173"]
  },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived, room) => {
      if (!room.members) return console.log("members not defined");

      room.members.forEach((user) => {
        if (user._id == newMessageReceived.senderId) return;

        socket.in(user._id).emit("message received", newMessageReceived);
      });
    });

    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  }
)
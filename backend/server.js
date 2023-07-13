const express = require("express");
const cookieParser = require("cookie-parser");
const rootRouter = require("./middleware/rootRouter");
const cors = require("cors");
const port = process.env.PORT;
require("./db/db");

const app = express();

app.use(cors({
  credentials: true,
  origin: ["https://gm-ui.vercel.app", "http://localhost:5173"]
}))

app.use(express.json());
app.use(cookieParser());
app.use(rootRouter);
const appDir = dirname(require.main.filename)
app.use('/images', express.static(appDir +  "/resources/uploads/"));



const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    credentials: true,
    origin: ["https://gm-ui.vercel.app", "http://localhost:5173"]
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

    socket.on("new message", (newMessageReceived, members) => {
      if (!members) return console.log("members not defined");

      members.forEach((user) => {
        if (user.userId == newMessageReceived.senderId) return;

        socket.in(user.userId).emit("message received", newMessageReceived);
      });
    });

    socket.on("new notification", (notifications) => {
      notifications.forEach((notification) => {
        socket.in(notification.userId).emit("new notification", notification);
      });
      
    })

    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  }
)
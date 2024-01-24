const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");

const {
  userJoinRoom,
  getRandomRoomNum,
  removeUserFromRoom,
} = require("./users");

const PORT = process.env.PORT || 3000;
const router = require("./router");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let waitingUsers = [];

app.use(cors());
app.options("*", cors());
app.use(router);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("selectMBTI", ({ mbtiType, mbtiImage }) => {
    socket.mbtiType = mbtiType;
    socket.mbtiImage = mbtiImage;
  });

  socket.on("join", ({ roomInfo }) => {
    const userInfo = {
      id: socket.id,
      mbtiType: socket.mbtiType,
      mbtiImage: socket.mbtiImage,
    };
    userJoinRoom(userInfo, roomInfo);

    if (userInfo.id && roomInfo.room) {
      socket.emit("message", {
        user: "admin",
        text: `${userInfo.mbtiType}已加入聊天室`,
      });
      socket.broadcast.to(roomInfo.room).emit("message", {
        user: "admin",
        text: `${userInfo.mbtiType}已加入聊天室`,
      });
    }
    socket.join(roomInfo.room);
  });

  socket.on("sendMessage", ({ message, userInfo, roomInfo }) => {
    io.to(roomInfo.room).emit("message", {
      user: userInfo.mbtiType,
      text: message,
      image: userInfo.mbtiImage,
    });
  });

  socket.on("randomChat", () => {
    waitingUsers.push({ socket, userInfo: socket.mbtiType });
    if (waitingUsers.length >= 2) {
      const user1 = waitingUsers.shift();
      const user2 = waitingUsers.shift();
      const randomRoomNum = getRandomRoomNum();

      user1.socket.join(randomRoomNum);
      user2.socket.join(randomRoomNum);

      user1.socket.emit("randomRoomNum", randomRoomNum);
      user2.socket.emit("randomRoomNum", randomRoomNum);
    }
  });

  socket.on("leaveRoom", ({ userInfo, roomInfo }) => {
    removeUserFromRoom(userInfo, roomInfo);
    socket.leave(roomInfo.room);
    if (userInfo.mbtiType) {
      io.to(roomInfo.room).emit("message", {
        user: "admin",
        text: "對方已離開聊天室",
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Runnging on:${PORT}`);
});

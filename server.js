const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");

const {
  addUser,
  userJoinRoom,
  getRandomRoomNum,
  removeUserFromRoom,
  checkIfUserIsInRoom,
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
    const { error, user } = addUser({ id: socket.id, mbtiType, mbtiImage });

    if (user) {
      socket.emit("userInfo", user);
    } else {
      socket.emit("error", error);
    }
  });

  socket.on("join", ({ roomInfo, userInfo }) => {
    if (!checkIfUserIsInRoom(userInfo.id, roomInfo.room)) {
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
    }
  });

  socket.on("sendMessage", ({ message, userInfo, roomInfo }) => {
    console.log(`Message sent in room ${roomInfo.room}: ${message}`);
    io.to(roomInfo.room).emit("message", {
      id: userInfo.id,
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

  socket.on("cancelRandomChat", () => {
    const index = waitingUsers.findIndex(
      (user) => user.socket.id === socket.id
    );
    if (index !== -1) {
      waitingUsers.splice(index, 1);
    }
  });

  socket.on("typing", ({ userInfo, roomInfo }) => {
    socket.to(roomInfo.room).emit("typing", { userInfo, isTyping: true });
  });

  socket.on("stopTyping", ({ userInfo, roomInfo }) => {
    socket.to(roomInfo.room).emit("typing", { userInfo, isTyping: false });
  });

  socket.on("leaveRoom", ({ userInfo, roomInfo }) => {
    removeUserFromRoom(userInfo, roomInfo);
    socket.leave(roomInfo.room);
    if (userInfo.id) {
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

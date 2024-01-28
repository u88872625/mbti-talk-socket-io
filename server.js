const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");

const {
  addUser,
  userJoinRoom,
  addToMatchQueue,
  findMatch,
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
    const { error, user } = addUser({ id: socket.id, mbtiType, mbtiImage });

    if (user) {
      console.log("Sending user info:", user);
      socket.emit("userInfo", user);
    } else {
      socket.emit("error", error);
    }
  });

  socket.on("join", ({ roomInfo, userInfo }) => {
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

  socket.on("requestMatch", ({ mbtiType }) => {
    const userInfo = { id: socket.id, mbtiType };
    addToMatchQueue(userInfo);

    const matchId = findMatch(mbtiType, userInfo.id);
    console.log(`Matching ID for ${mbtiType}: ${matchId}`);

    if (matchId && matchId !== userInfo.id) {
      const roomId = getRandomRoomNum();
      socket.join(roomId);
      io.to(matchId).socketsJoin(roomId);

      console.log(
        `Emitting matchFound to ${socket.id} and ${matchId} with roomId: ${roomId}`
      );
      io.to(socket.id).emit("matchFound", { roomId });
      io.to(matchId).emit("matchFound", { roomId });
    }
    console.log(`request:${userInfo}`);
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

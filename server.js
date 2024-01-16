const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const router = require("./router");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.options("*", cors());
app.use(router);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Runnging on:${PORT}`);
});

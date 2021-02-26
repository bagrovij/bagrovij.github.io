const express = require("express");
const app = express();
const http = require("http").createServer(app);
const port = process.env.port || 3000;
const path = require("path");
const io = require("socket.io")(http);

app.use(express.static("public"));
http.listen(port, () => {
  console.log("listening on *:" + port);
});

const users = [];
const user = {};

io.on("connection", (socket) => {
  socket.name = "Anonymous";
  socket.color = "#ffffff";
  socket.on("connected", () => {
    user[socket.id] = {
      name: "Anonymous",
      color: "#ffffff",
      id: socket.id
    }
    io.emit("get message", {
      user: {name: "Server", color: "#58db7b", id: "-999"},
      message: socket.name + " joined"
    });
  });
  socket.on("disconnect", () => {
    io.emit("get message", {
      user: {name: "Server", color: "#58db7b", id: "-999"},
      message: socket.name + " left"
    });
  })
  socket.on("chat message", (data) => {
      io.emit("get message", {
        user: user[socket.id],
        message: data.message
      });
  });
});


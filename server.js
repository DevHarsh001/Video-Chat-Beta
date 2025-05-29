const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

// Generate a unique room id and redirect
app.get("/start", (req, res) => {
  const roomId = uuidv4();
  const type = req.query.type === "audio" ? "audio" : "video";
  res.redirect(`/room/${roomId}?type=${type}`);
});

// Serve room page
app.get("/room/:roomId", (req, res) => {
  res.sendFile(__dirname + "/public/room.html");
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("signal", (data) => {
      socket.to(roomId).emit("signal", data);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

const PORT = process.env.PORT || 3200;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

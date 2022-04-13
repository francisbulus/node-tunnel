import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => res.send("API up and running!"));

io.on("connection", (socket) => {
  console.log("a user connected");
});

export default server;

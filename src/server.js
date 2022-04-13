import express from "express";
import http from "http";
import { Server } from "socket.io";
import Request from "./streams/request.js";
import Response from "./streams/response.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
let connections = {};

io.on("connection", (socket) => {
  const host = socket.handshake.headers.host;
  connections[host] = socket;
});

app.get("/", (req, res) => {
  const host = req.headers.host;
  const id = 599992;
  const inbound = new Request(id, connections[host], req);
  req.pipe(inbound);
  const outbound = new Response(id, connections[host]);
  outbound.once("response", (code, msg, headers) => {
    res.writeHead(code, msg, headers);
  });
  outbound.pipe(res);
});

export default server;

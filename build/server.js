import express from "express";
import http from "http";
import { Server } from "socket.io";
import Request from "./streams/request.js";
import Response from "./streams/response.js";
import { v4 } from "uuid";
import morgan from "morgan";
import EventEmitter from "events";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
let connections = {};

io.on("connection", socket => {
  const host = socket.handshake.headers.host;
  connections[host] = socket;
  console.log(host);

  const handleConnError = e => {
    delete connections[host];
    socket.off("message", handlePing);
    socket.off("disconnect", onDisconnect);
  };

  const onDisconnect = () => {
    delete connections[host];
    socket.off("message", handlePing);
    socket.off("error", handleConnError);
  };

  socket.once("disconnect", onDisconnect);

  const handlePing = msg => {
    if (msg === "ping") {
      socket.send("pong");
    }
  };

  socket.on("message", handlePing);
  socket.once("disconnect", onDisconnect);
  socket.once("error", handleConnError);
});

app.use(morgan("tiny"));
// app.use(requestID());

app.use("/", (req, res) => {
  const socket = connections[req.headers.host];
  if (!socket) {
    res.status(404);
    res.send("Not Found");
    return;
  }
  const id = v4();
  const inbound = new Request({
    id,
    socket,
    req: {
      method: req.method,
      headers: Object.assign({}, req.headers),
      path: req.url
    }
  });
  const onReqError = e => {
    inbound.destroy(new Error(e || "Aborted"));
  };

  const handleResponse = (statusCode, statusMessage, headers) => {
    inbound.off("requestError", handleRequestError);
    res.writeHead(statusCode, statusMessage, headers);
  };

  req.once("aborted", onReqError);
  req.once("error", onReqError);
  req.pipe(inbound);
  req.once("finish", () => {
    req.off("aborted", onReqError);
    req.off("error", onReqError);
  });
  const outbound = new Response({ id, socket });

  const handleSocketError = () => {
    res.end(500);
  };
  const handleRequestError = () => {
    outbound.off("response", handleResponse);
    outbound.destroy();
    res.status(502);
    res.end("yikes, there's a equest error");
  };

  outbound.once("requestError", handleRequestError);
  outbound.once("response", handleResponse);
  outbound.pipe(res);
  outbound.once("error", handleSocketError);
  socket.once("close", handleSocketError);
  res.once("close", () => {
    socket.off("close", handleSocketError);
    outbound.off("error", handleSocketError);
  });
});

export default server;
//# sourceMappingURL=server.js.map
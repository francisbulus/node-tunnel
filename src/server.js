import express from "express";
import http from "http";
import { Server } from "socket.io";
import Request from "./streams/request.js";
import Response from "./streams/response.js";
import morgan from "morgan";
import crypto from "crypto";
import {
  handleBadRequestToSocket,
  handleRequestError,
  handleSocketError,
} from "./utils/error-handlers/server.js";
import {
  handleSocketClientDisconnect,
  handlePing,
} from "./utils/general-helpers/sockets.js";
import { handleResponse } from "./utils/general-helpers/server.js";
import { handleSocketConnectionError } from "./utils/error-handlers/sockets.js";
import { checkConnection } from "./utils/general-helpers/sockets.js";
import cors from "cors";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { createClient } from "redis";
import proxyaddr from "proxy-addr";

const address = proxyaddr;
const store = createClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
let connections = {};

store.on("connect", function () {
  console.log("Connected!");
});

await store.connect();

io.on("connection", async (socket) => {
  const conn = nanoid(10);
  const host = socket.handshake.headers.host;
  socket.join(conn);
  socket.send(conn);
  socket.on("room", function (room) {
    socket.join(room);
    io.to(room).emit("message", {
      message: `${host} connected!`,
      created: Date.now(),
    });
  });
  await store.set(conn, socket);
  socket.on("message", handlePing.bind(null, socket));
  socket.once("disconnect", function () {
    handleSocketClientDisconnect(socket, connections);
  });
  socket.once("error", function () {
    handleSocketConnectionError(socket, connections);
  });
});

app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());
app.all(
  "/",
  (req, res, next) => {
    checkConnection(req, res, next, store);
  },
  (req, res) => {
    const ip = address(req, (proxy) => proxy);
    const socket = res.locals.socket;
    const id = crypto.randomUUID();
    const inbound = new Request({
      id,
      socket,
      req: {
        method: req.method,
        headers: Object.assign({}, req.headers),
        path: req.url,
      },
    });

    req.once("aborted", handleBadRequestToSocket.bind(null, req));
    req.once("error", handleBadRequestToSocket.bind(null, req));
    req.once("finish", () => {
      req.off("aborted", handleBadRequestToSocket.bind(null, req));
      req.off("error", handleBadRequestToSocket.bind(null, req));
    });
    req.pipe(inbound);
    const outbound = new Response({ id, socket });

    const handleSocketErrorWrapper = () => {
      handleSocketError(res);
    };

    outbound.once("requestError", function () {
      handleRequestError(res, outbound);
    });
    outbound.once("response", function (statusCode, statusMessage, headers) {
      handleResponse(statusCode, statusMessage, headers, inbound, res);
    });
    outbound.once("error", handleSocketErrorWrapper);
    outbound.pipe(res);
    res.once("close", () => {
      socket.off("close", handleSocketErrorWrapper);
      outbound.off("error", handleSocketErrorWrapper);
    });
    socket.once("close", handleSocketErrorWrapper);
  }
);

// // test

export default server;

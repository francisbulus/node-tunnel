import express from "express";
import http from "http";
import { Server } from "socket.io";
import Request from "./streams/request.js";
import Response from "./streams/response.js";
import morgan from "morgan";
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
import { createClient } from "redis";
import crypto from "crypto";
const store = createClient({
  url: process.env.REDIS_URL,
});
const app = express();
const server = http.createServer(app);
const io = new Server(server);

store.on("connect", function () {
  console.log("connected to some rando!");
});

const connToRedis = async () => {
  await store.connect();
};

let access;

connToRedis();
io.on("connection", (socket) => {
  access = socket;
  socket.once("join", async function (room) {
    socket.join(room);
    await store.set(room, socket.id);
    io.to(room).emit("room-confirmation", {
      message: `You've been connected!`,
      joined_at: Date.now(),
    });
  });
  socket.on("message", handlePing.bind(null, socket));
  socket.once("disconnect", function () {
    handleSocketClientDisconnect(socket, access);
  });
  socket.once("error", function () {
    handleSocketConnectionError(socket, store, access);
  });
});

app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());
app.use(
  "/",
  // async (req, res, next) => {
  //   checkConnection(req, res, next, store);
  // },
  (req, res) => {
    // if (res.locals.connectedUA) res.status(200).send("whut whut connected");
    const socket = access;
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
      handleSocketError(res, socket);
    };

    outbound.once("proxy-request-error", function () {
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

export { io, store };

export default server;

import express, { Express, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
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
import Inbound from "./streams/inbound.js";
import Outbound from "./streams/outbound.js";
import { Req } from "./utils/types.js";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const store = createClient({
  url: process.env.REDIS_URL,
});
const app: Express = express();
const server = http.createServer(app);
const io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> =
  new Server(server);

store.on("connect", function () {
  console.log("connected to some rando!");
});

const connToRedis = async (): Promise<void> => {
  await store.connect();
};

let access: any;

connToRedis();
io.on("connection", (socket): void => {
  access = socket;
  console.log("access", access);
  socket.once("join", async function (room): Promise<void> {
    socket.join(room);
    await store.set(room, socket.id);
    io.to(room).emit("room-confirmation", {
      message: `You've been connected!`,
      joined_at: Date.now(),
    });
  });
  socket.on("message", function (msg): void {
    handlePing(msg, socket);
  });
  socket.once("disconnect", function (): void {
    handleSocketClientDisconnect(socket, access);
  });
  socket.once("error", function (): void {
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
    const socket = access;
    const id = crypto.randomUUID();
    const inbound = new Inbound(id, socket, {
      method: req.method,
      headers: Object.assign({}, req.headers),
      path: req.url,
    });

    req.once("aborted", function (err, req) {
      handleBadRequestToSocket(err, req);
    });
    req.once("error", function (err: string, req: Req) {
      handleBadRequestToSocket(err, req);
    });
    req.once("finish", () => {
      req.off("aborted", function (err, req) {
        handleBadRequestToSocket(err, req);
      });
      req.off("error", function (err, req) {
        handleBadRequestToSocket(err, req);
      });
    });
    req.pipe(inbound);
    const outbound = new Outbound(id, socket);

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

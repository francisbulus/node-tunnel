import { handleSocketConnectionError } from "../error-handlers/sockets.js";
import proxyAddr from "proxy-addr";
import { io } from "../../server.js";
import { getToken } from "./server.js";

export const handlePing = (msg, socket) => {
  if (msg !== "ping") return;
  socket.send("pong");
};

export const handleSocketClientDisconnect = (socket) => {
  socket.off("error", handleSocketConnectionError);
  socket.off("message", handlePing);
};

export const checkConnection = async (req, res, next, store) => {
  const clientIp = proxyAddr(req, (proxy) => proxy);
  const roomAccessFromInput = getToken(req);
  const roomAccessFromSession = await store.get(clientIp);
  let socket;
  const access = roomAccessFromSession || roomAccessFromInput;
  if (!access) {
    res.sendFile("index.html", { root: "src/" + "public" });
    return;
  } else {
    const socketId = await store.get(access);
    socket = io.sockets.sockets.get(socketId);
    if (!roomAccessFromSession && socket) store.set(clientIp, access);
    if (!socket) {
      await store.del(access);
      await store.del(clientIp);
      res.status(404).send("No socket connection found for given client");
      return;
    }
    res.locals.socket = socket;
    res.locals.room = access;
    next();
  }
};

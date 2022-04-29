import { handleSocketConnectionError } from "../error-handlers/sockets.js";
import proxyAddr from "proxy-addr";
import { io, store } from "../../server.js";
import { getToken } from "./server.js";

export const handlePing = (msg, socket) => {
  if (msg !== "ping") return;
  socket.send("pong");
};

export const handleSocketClientDisconnect = async (socket, access) => {
  await store.del(access);
  socket.off("error", handleSocketConnectionError);
  socket.off("message", handlePing);
};

export const checkConnection = async (req, res, next, store, adapter) => {
  const clientIp = proxyAddr(req, (proxy) => proxy);
  const roomAccessFromInput = getToken(req);
  const roomAccessFromSession = await store.get(clientIp);
  let socket;
  const access = roomAccessFromSession || roomAccessFromInput;

  // // experiment starts here
  // res.locals.socket = adapter;
  // // res.locals.room = access;
  // next();

  // experiment ends here
  if (!access) {
    res.sendFile("index.html", { root: "src/" + "public" }, (err) => {
      if (err) {
        res.end(500);
      } else res.status(200);
    });
    return;
  } else {
    const socketId = await store.get(access);
    socket = io.sockets.sockets.get(socketId);
    if (!roomAccessFromSession && socket) store.set(clientIp, access);
    if (!socket) {
      await store.del(access);
      await store.del(clientIp);
      res
        .status(404)
        .send("No socket connection found for the given room access key");
      return;
    }
    res.locals.socket = socket;
    next();
  }
};

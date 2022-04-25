import { handleSocketConnectionError } from "../error-handlers/sockets.js";
import proxyAddr from "proxy-addr";
import { io } from "../../server.js";

export const handlePing = (msg, socket) => {
  if (msg !== "ping") return;
  socket.send("pong");
};

export const handleSocketClientDisconnect = (socket, connections) => {
  const host = socket.handshake.headers.host;
  // delete connections[host];
  socket.off("error", handleSocketConnectionError);
  socket.off("message", handlePing);
};

export const checkConnection = async (req, res, next, store, socket) => {
  // let socket;
  // let id;
  // const ip = proxyAddr(req, (proxy) => proxy);
  // const key = req.body && req.body.key;
  // const clientConnection = await store.get(ip);
  // if (!id) id = await store.get("dope");
  // if (!socket) socket = io.sockets.sockets.get(id);
  // if (!clientConnection && !key) {
  //   res.sendFile("index.html", { root: "src/" + "public" });
  //   return;
  // } else {
  //   // let socket = io.sockets.sockets.get(id);
  //   if (!socket) {
  //     res.status(404).send("No socket connection found for given client");
  //     return;
  //   }
  // if (!clientConnection) await store.set(ip, key);
  res.locals.socket = socket;
  next();
};

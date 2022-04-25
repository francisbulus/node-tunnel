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
  const ip = proxyAddr(req, (proxy) => proxy);
  const roomAccessKey = req.body && req.body.key;
  const roomAccessFromSession = await store.get(ip);
  let access = roomAccessFromSession || roomAccessKey;
  // await store.del(ip);
  // let socket;
  if (false) {
    // !access
    res.sendFile("index.html", { root: "src/" + "public" });
    return;
  } else {
    if (true) {
      //!rocket and access
      const id = await store.get("proof");
      socket = io.sockets.sockets.get(id);
    }
    // if (!socket) {
    //   res.status(404).send("No socket connection found for given client");
    //   return;
    // }

    // if (socket && roomAccessKey && !roomAccessFromSession)
    //   await store.set(ip, access);
    res.locals.socket = socket;
    next();
  }
};

// ip >> ip
// ip >> sessionId

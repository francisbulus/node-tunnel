import { handleSocketConnectionError } from "../error-handlers/sockets.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import proxyAddr from "proxy-addr";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const handlePing = (msg, socket) => {
  if (msg !== "ping") return;
  socket.send("pong");
};

console.log(__dirname);

export const handleSocketClientDisconnect = (socket, connections) => {
  const host = socket.handshake.headers.host;
  delete connections[host];
  socket.off("error", handleSocketConnectionError);
  socket.off("message", handlePing);
};

export const checkConnection = async (req, res, next, store) => {
  const ip = proxyAddr(req, (proxy) => proxy);
  const key = req.body && req.body.key;
  const clientConnection = await store.get(ip);
  if (!clientConnection) {
    await store.set(ip, key);
    res.sendFile("index.html", { root: "src/" + "public" });
  } else {
    const socket = await store.get(key);
    if (!socket) {
      res.status(404).send("No socket connection found for given client");
      return;
    }
    res.locals.socket = socket;
    next();
  }
};

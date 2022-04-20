import { handleSocketConnectionError } from "../error-handlers/sockets.js";

export const handlePing = (msg, socket) => {
  if (msg !== "ping") return;
  socket.send("pong");
};

export const handleSocketClientDisconnect = (socket, connections) => {
  const host = socket.handshake.headers.host;
  delete connections[host];
  socket.off("error", handleSocketConnectionError);
  socket.off("message", handlePing);
};

export const checkConnection = (req, res, next, connections) => {
  const socket = connections[req.headers.host];
  if (!socket) {
    res.status(404).send("No socket connection found for given client");
    return;
  }
  res.locals.socket = socket;
  next();
};
//# sourceMappingURL=sockets.js.map
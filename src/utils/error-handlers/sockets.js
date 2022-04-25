import {
  handlePing,
  handleSocketClientDisconnect,
} from "../general-helpers/sockets.js";

export const handleSocketConnectionError = (socket, connections) => {
  // delete connections[host];
  socket.off("message", handlePing);
  socket.off("disconnect", handleSocketClientDisconnect);
};

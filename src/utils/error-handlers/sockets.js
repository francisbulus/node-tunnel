import {
  handlePing,
  handleSocketClientDisconnect,
} from "../general-helpers/sockets.js";

export const handleSocketConnectionError = async (socket, store, access) => {
  await store.del(access);
  socket.off("message", handlePing);
  socket.off("disconnect", handleSocketClientDisconnect);
};

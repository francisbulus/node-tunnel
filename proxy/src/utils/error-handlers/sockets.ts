import {
  handlePing,
  handleSocketClientDisconnect,
} from "../general-helpers/sockets.js";
import { Socket } from "../types";

export const handleSocketConnectionError = async (
  socket: Socket,
  store: any,
  access: string
) => {
  await store.del(access);
  socket.off("message", handlePing);
  socket.off("disconnect", handleSocketClientDisconnect);
};

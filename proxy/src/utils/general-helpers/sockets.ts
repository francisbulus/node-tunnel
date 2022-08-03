import { handleSocketConnectionError } from "../error-handlers/sockets.js";
import proxyAddr from "proxy-addr";
import { io } from "../../server.js";
import { getToken } from "./server.js";
import { StreamCallback, Socket } from "../types.js";
import { Request, Response } from "express";

export const handlePing = (msg: string, socket: Socket): void => {
  if (msg !== "ping") return;
  socket.send("pong");
};

export const handleSocketClientDisconnect = async (
  socket: Socket,
  access: string
) => {
  socket.off("error", handleSocketConnectionError);
  socket.off("message", handlePing);
};

export const checkConnection = () => {
  console.log("");
};

// export const checkConnection = async (
//   req: Request,
//   res: Response,
//   next: StreamCallback,
//   store: {
//     get: (arg0: string) => any;
//     set: (arg0: string, arg1: any) => void;
//     del: (arg0: string) => any;
//   }
// ) => {
//   const clientIp = proxyAddr(req, (proxy: any): any => proxy);
//   const roomAccessFromInput = getToken(req);
//   const roomAccessFromSession = await store.get(clientIp);
//   let socket;
//   const access = roomAccessFromSession || roomAccessFromInput;
//   if (!access) {
//     res.sendFile("index.html", { root: "src/" + "public" }, (err) => {
//       if (err) {
//         res.end(500);
//       }
//       next();
//     });
//   } else {
//     const socketId = await store.get(access);
//     socket = io.sockets.sockets.get(socketId);
//     if (!roomAccessFromSession && socket) store.set(clientIp, access);
//     if (!socket) {
//       await store.del(access);
//       await store.del(clientIp);
//       res
//         .status(404)
//         .send("No socket connection found for the given room access key");
//       return;
//     }
//     res.locals.socket = socket;
//     next();
//   }
// };

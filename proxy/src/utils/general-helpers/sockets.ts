import { handleSocketConnectionError } from "../error-handlers/sockets.js";
import proxyAddr from "proxy-addr";
import { io, store } from "../../server.js";
import { getToken } from "./server.js";
import { StreamCallback, Socket } from "../types.js";
import { IncomingMessage } from "http";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const handlePing = (msg: string, socket: Socket): void => {
  if (msg !== "ping") return;
  socket.send("pong");
};

export const handleSocketClientDisconnect = async (
  socket: any,
  access: string
) => {
  await store.del(access);
  socket.off("error", handleSocketConnectionError);
  socket.off("message", handlePing);
};

export const checkConnection = async (
  req: IncomingMessage,
  res: {
    sendFile: (
      arg0: string,
      arg1: { root: string },
      arg2: (err: any) => void
    ) => void;
    end: (arg0: number) => void;
    status: (arg0: number) => {
      (): any;
      new (): any;
      send: { (arg0: string): void; new (): any };
    };
    locals: {
      socket: Socket;
    };
  },
  next: StreamCallback,
  store: {
    get: (arg0: string) => any;
    set: (arg0: string, arg1: any) => void;
    del: (arg0: string) => any;
  }
) => {
  const clientIp = proxyAddr(req, (proxy) => proxy);
  const roomAccessFromInput = getToken(req);
  const roomAccessFromSession = await store.get(clientIp);
  let socket;
  const access = roomAccessFromSession || roomAccessFromInput;

  // experiment ends here
  if (!access) {
    res.sendFile("index.html", { root: "src/" + "public" }, (err) => {
      if (err) {
        res.end(500);
      }
      next();
    });
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

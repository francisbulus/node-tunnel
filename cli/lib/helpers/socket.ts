import { io, Socket } from "socket.io-client";
import http from "http";
import { nanoid } from "nanoid";
import Inbound from "../streams/inbound";
import Outbound from "../streams/outbound";
import { DefaultEventsMap } from "@socket.io/component-emitter";

let socket: Socket<DefaultEventsMap>;
export function persistConnection(): void {
  setTimeout(() => {
    if (socket && socket.connected) {
      socket.send("ping");
    }
    persistConnection();
  }, 5000);
}

export function connect(config: { [option: string]: any }): void {
  socket = io(config.remote, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    const room = nanoid(5);
    socket.emit("join", room);
    if (socket.connected) {
      console.log(
        `Send this code "${room}" to the client so they access at https://node-tunnel.herokuapp.com `
      );
    }
  });

  socket.on("connect_error", (e) => {
    console.error(e.message);
  });

  socket.on("room-confirmation", (msg) => {
    console.log("Aye, we are game.");
  });

  socket.on("request", (id, req) => {
    req.port = config.port;
    const inbound = new Inbound(id, socket);
    const localServerReq = http.request(req);
    inbound.pipe(localServerReq);
    const handleLocalServerResponse = (res: {
      statusCode: any;
      statusMessage: any;
      headers: any;
      pipe: (arg0: any) => void;
    }) => {
      localServerReq.off("error", handleLocalServerError);
      const outbound = new Outbound(id, socket);
      outbound.writeHead(res.statusCode, res.statusMessage, res.headers);
      res.pipe(outbound);
    };

    const handleLocalServerError = (err: Error): void => {
      localServerReq.off("response", handleLocalServerResponse);
      socket.emit("request-error", id, err && err.message);
      inbound.destroy(err);
    };
    localServerReq.on("response", handleLocalServerResponse);
    localServerReq.on("error", handleLocalServerError);
  });
  persistConnection();
}

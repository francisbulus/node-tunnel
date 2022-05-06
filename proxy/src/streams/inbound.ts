import { Writable } from "stream";
import { Request } from "express";
import { Socket, StreamCallback } from "../utils/types";

export default class Inbound extends Writable {
  constructor(private id: string, private socket: Socket, req: any) {
    super();
    this.socket = socket;
    this.id = id;
    this.socket.emit("request", id, req);
  }

  _write(data: any, enc: any, next: StreamCallback) {
    this.socket.emit("inbound-pipe", this.id, data);
    this.socket.conn.once("drain", () => {
      next();
    });
  }

  _writev(data: any, next: StreamCallback) {
    this.socket.emit("inbound-pipes", this.id, data);
    this.socket.conn.once("drain", () => {
      next();
    });
  }

  _destroy(err: any, next: StreamCallback) {
    if (!err) next();
    this.socket.emit("inbound-pipe-error", this.id, err && err.message);
    this.socket.conn.once("drain", () => {
      next();
    });
    return;
  }

  _final(next: StreamCallback) {
    this.socket.emit("inbound-pipe-end", this.id);
    this.socket.conn.once("drain", () => {
      next();
    });
  }
}

import { Writable } from "stream";
import { Socket, StreamCallback } from "../types";

export default class Outbound extends Writable {
  constructor(private id: number, private socket: Socket) {
    super();
    this.id = id;
    this.socket = socket;
  }

  _writev(data: any, next: StreamCallback): void {
    this.socket.emit("outbound-pipes", this.id, data);
    this.socket.io.engine.once("drain", () => {
      next();
    });
  }

  _write(data: any, _: any, next: StreamCallback): void {
    this.socket.emit("outbound-pipe", this.id, data);
    this.socket.io.engine.once("drain", () => {
      next();
    });
  }

  _final(next: StreamCallback): void {
    this.socket.emit("outbound-pipe-end", this.id);
    this.socket.io.engine.once("drain", () => {
      next();
    });
  }

  public writeHead(
    statusCode: number,
    statusMessage: string,
    headers: any
  ): void {
    this.socket.emit("response", this.id, {
      statusCode,
      statusMessage,
      headers,
    });
  }

  _destroy(e: Error | null, next: StreamCallback): void {
    if (e) {
      this.socket.emit("outbound-pipe-error", this.id, e && e.message);
      this.socket.io.engine.once("drain", () => {
        next();
      });
      return;
    }
    next();
  }
}

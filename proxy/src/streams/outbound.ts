import { Duplex, Readable } from "stream";
import { Socket, StreamCallback } from "../utils/types";
export default class Outbound extends Duplex {
  constructor(public id: string, public socket: any) {
    super();
    this.socket = socket;
    this.id = id;
    const handlePipe = (id: string, data: any) => {
      if (this.id === id) {
        this.push(data);
      }
    };
    const handlePipes = (id: string, data: any[]) => {
      if (this.id === id) {
        data.forEach((chunk: any) => {
          this.push(chunk);
        });
      }
    };
    const handleStreamClose = (id: string, data: any) => {
      if (this.id !== id) return;
      if (data) this.push(data);
      this.socket.off("outbound-pipe", handlePipe);
      this.socket.off("outbound-pipes", handlePipes);
      this.socket.off("outbound-pipe-error", handleStreamError);
      this.socket.off("outbound-pipe-end", handleStreamClose);
      this.push(null);
    };

    const handleResponse = (
      id: string,
      data: { statusCode: number; statusMessage: string; headers: any }
    ) => {
      if (this.id === id) {
        this.socket.off("request-error", handleBadRequest);
        this.socket.off("response", handleResponse);
        const { statusCode, statusMessage, headers } = data;
        this.emit("response", statusCode, statusMessage, headers);
      }
    };

    const handleBadRequest = (id: string, error: any) => {
      if (this.id === id) {
        this.socket.off("response", handleResponse);
        this.socket.off("outbound-pipe", handlePipe);
        this.socket.off("outbound-pipes", handlePipes);
        this.socket.off("outbound-pipe-end", handleStreamClose);
        this.socket.off("outbound-pipe-error", handleStreamError);
        this.socket.off("request-error", handleBadRequest);
        this.emit("proxy-request-error", error);
      }
    };

    const handleStreamError = (id: string, err: string | undefined) => {
      if (this.id !== id) {
        return;
      }
      this.socket.off("outbound-pipe", handlePipe);
      this.socket.off("outbound-pipes", handlePipes);
      this.socket.off("outbound-pipe-error", handleStreamError);
      this.socket.off("outbound-pipe-end", handleStreamClose);
      this.destroy(new Error(err));
    };

    this.socket.on("response", handleResponse);
    this.socket.on("outbound-pipe", handlePipe);
    this.socket.on("outbound-pipes", handlePipes);
    this.socket.on("outbound-pipe-end", handleStreamClose);
    this.socket.on("request-error", handleBadRequest);
    this.socket.on("outbound-pipe-error", handleStreamError);
  }

  _destroy(error: Error | null, next: (error: Error | null) => void): void {
    if (error) {
      this.socket.emit("outbound-pipe-error", this.id, error && error.message);
      this.socket.conn.once("drain", () => {
        next(error);
      });
      return;
    }
    next(null);
  }

  _read(size: any) {}
}

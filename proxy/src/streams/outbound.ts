import { Readable } from "stream";
export default class Outbound extends Readable {
  socket: any;
  id: any;
  constructor(id, socket) {
    super();
    this.socket = socket;
    this.id = id;

    /* The handlePipe function processes simple chunks of data being piped - 
    ideally this would be data streamed via _write
    */
    const handlePipe = (id, data) => {
      if (this.id === id) {
        this.push(data);
      }
    };
    const handlePipes = (id, data) => {
      if (this.id === id) {
        data.forEach((chunk) => {
          this.push(chunk);
        });
      }
    };
    const handleStreamClose = (id, data) => {
      if (this.id !== id) return;
      if (data) this.push(data);
      this.socket.off("outbound-pipe", handlePipe);
      this.socket.off("outbound-pipes", handlePipes);
      this.socket.off("outbound-pipe-error", handleStreamError);
      this.socket.off("outbound-pipe-end", handleStreamClose);
      this.push(null);
    };

    const handleResponse = (id, data) => {
      if (this.id === id) {
        this.socket.off("request-error", handleBadRequest);
        this.socket.off("response", handleResponse);
        const { statusCode, statusMessage, headers } = data;
        this.emit("response", statusCode, statusMessage, headers);
      }
    };

    const handleBadRequest = (id, error) => {
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

    const handleStreamError = (id, err) => {
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

  _read(size) {}
}

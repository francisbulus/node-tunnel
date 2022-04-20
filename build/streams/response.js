import { Readable } from "stream";
export default class Response extends Readable {
  constructor({ id, socket }) {
    super();
    this._socket = socket;
    this._id = id;

    /* The handlePipe function processes simple chunks of data being piped - 
    ideally this would be data streamed via _write
    */
    const handlePipe = (id, data) => {
      if (this._id === id) {
        this.push(data);
      }
    };
    const handlePipes = (id, data) => {
      if (this._id === id) {
        data.forEach(chunk => {
          this.push(chunk);
        });
      }
    };
    const handleStreamClose = (id, data) => {
      if (this._id !== id) return;
      if (data) this.push(data);
      this._socket.off("outbound-pipe", handlePipe);
      this._socket.off("outbound-pipes", handlePipes);
      this._socket.off("outbound-pipe-error", handleStreamError);
      this._socket.off("outbound-pipe-end", handleStreamClose);
      this.push(null);
    };

    const handleResponse = (id, data) => {
      if (this._id === id) {
        this._socket.off("request-error", handleBadRequest);
        this._socket.off("response", handleResponse);
        const { statusCode, statusMessage, headers } = data;
        this.emit("response", statusCode, statusMessage, headers);
      }
    };

    const handleBadRequest = (id, error) => {
      if (this._id === id) {
        this._socket.off("response", handleResponse);
        this._socket.off("outbound-pipe", handlePipe);
        this._socket.off("outbound-pipes", handlePipes);
        this._socket.off("outbound-pipe-end", handleStreamClose);
        this._socket.off("outbound-pipe-error", handleStreamError);
        this._socket.off("request-error", handleBadRequest);
        this.emit("requestError", error);
      }
    };

    const handleStreamError = (id, err) => {
      if (this._id !== id) {
        return;
      }
      this._socket.off("outbound-pipe", handlePipe);
      this._socket.off("outbound-pipes", handlePipes);
      this._socket.off("outbound-pipe-error", handleStreamError);
      this._socket.off("outbound-pipe-end", handleStreamClose);
      this.destroy(new Error(err));
    };

    this._socket.on("response", handleResponse);
    this._socket.on("outbound-pipe", handlePipe);
    this._socket.on("outbound-pipes", handlePipes);
    this._socket.on("outbound-pipe-end", handleStreamClose);
    this._socket.on("request-error", handleBadRequest);
    this._socket.on("outbound-pipe-error", handleStreamError);
  }

  _read(size) {}
}
//# sourceMappingURL=response.js.map
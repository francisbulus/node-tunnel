import { Readable } from "stream";

export default class Response extends Readable {
  constructor({ id, socket }) {
    super();
    this._id = id;
    this._socket = socket;

    /* 
    The handlePipe function processes simple chunks of data being piped -
    ideally this would be data streamed via _write
    */
    const handlePipe = (id, data) => {
      if (this._id === id) this.push(data);
    };
    /* 
    handlePipes processes multiple chunks of data being piped -
    ideally this would be data streamed via _writev
    */
    const handlePipes = (id, data) => {
      if (this._id === id) data.forEach(chunk => this.push(chunk));
    };

    const handlePipeEnd = (id, data) => {
      if (this._id !== id) {
        return;
      }
      if (data) {
        this.push(data);
      }
      this._socket.off("outbound-pipe", handlePipe);
      this._socket.off("outbound-pipes", handlePipes);
      this._socket.off("outbound-pipe-error", handleError);
      this._socket.off("outbound-pipe-end", handlePipeEnd);
      this.push(null);
    };

    const handleError = (id, err) => {
      if (this._id !== id) {
        return;
      }
      this._socket.off("outbound-pipe", handlePipe);
      this._socket.off("outbound-pipes", handlePipes);
      this._socket.off("outbound-pipe-error", handleError);
      this._socket.off("outbound-pipe-end", handlePipeEnd);
      this.destroy(new Error(err));
    };

    const handleResponse = (id, data) => {
      if (this._id === id) {
        this._socket.off("response", handleResponse);
        this._socket.off("request-error", handleBadRequest);
        this.emit("response", data.statusCode, data.statusMessage, data.headers);
      }
    };

    const handleBadRequest = (id, err) => {
      if (this._id === id) {
        this._socket.off("request-error", handleBadRequest);
        this._socket.off("response", handleResponse);
        this._socket.off("outbound-pipe", handlePipe);
        this._socket.off("outbound-pipes", handlePipes);
        this._socket.off("outbound-pipe-error", handleError);
        this._socket.off("outbound-pipe-end", handlePipeEnd);
        this.emit("requestError", err);
      }
    };

    this._socket.on("response", handleResponse);
    this._socket.on("outbound-pipe", handlePipe);
    this._socket.on("outbound-pipes", handlePipes);
    this._socket.on("outbound-pipe-error", handleError);
    this._socket.on("outboound-pipe-end", handlePipeEnd);
    this._socket.on("request-error", handleBadRequest);
  }
  _read(size) {}
}
//# sourceMappingURL=response.js.map
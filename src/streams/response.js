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
      if (this._id !== id) return;
      this.push(data);
    };
    /* 
    handlePipes processes multiple chunks of data being piped -
    ideally this would be data streamed via _writev
   */
    const handlePipes = (id, data) => {
      if (this._id !== id) return;
      data.forEach((chunk) => this.push(chunk));
    };
    this._socket.on("response", (id, data) => {
      if (this._id !== id) return;
      const { statusCode, statusMessage, headers } = data;
      this.emit("response", statusCode, statusMessage, headers);
    });
    this._socket.on("outbound-pipe", handlePipe);
    this._socket.on("outbound-pipes", handlePipes);
  }
}

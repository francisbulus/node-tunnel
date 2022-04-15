import { Writable } from "stream";

export default class Request extends Writable {
  constructor({ id, socket, req }) {
    super();
    this._socket = socket;
    this._id = id;
    this._socket.emit("request", id, req);
  }

  /*
  This is a method for writing streams as well but
  it gets deprioritized - for _writev - when a stream contains
  multiple chunks to be written at once.
  */
  _write(data, enc, next) {
    this._socket.emit("inbound-pipe", this._id, data);
    this._socket.conn.once("drain", () => {
      next();
    });
  }

  /* 
  For processing multiple chunks at once.From the Node docs:
  If a stream implementation is capable of processing 
  multiple chunks of data at once, 
  the writable._writev() method should be implemented.
   Within the context of the app, it accepts the data - in chunks - that 
  will be sent to the local server
  */
  _writev(data, next) {
    this._socket.emit("inbound-pipes", this._id, data);
    this._socket.conn.once("drain", () => {
      next();
    });
  }

  _final(next) {
    this._socket.emit("inbound-pipe-end", this._id);
    this._socket.conn.once("drain", () => {
      next();
    });
  }

  _destroy(err, next) {
    if (err) {
      this._socket.emit("inbound-pipe-error", this._id, err && err.message);
      this._socket.conn.once("drain", () => {
        next();
      });
      return;
    }
    next();
  }
}
//# sourceMappingURL=request.js.map
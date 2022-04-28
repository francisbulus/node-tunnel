import { Writable } from "stream";

export default class Request extends Writable {
  constructor({ id, socket, req }) {
    super();
    this._socket = socket;
    this._id = id;
    // this._room = room;
    this._socket.emit("request", id, req);
  }

  /*
 This adds the write functionality - native to the response stream - to the custom request 
 stream
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

  _destroy(err, next) {
    if (!err) next();
    this._socket.emit("inbound-pipe-error", this._id, err && err.message);
    this._socket.conn.once("drain", () => {
      next();
    });
    return;
  }

  _final(next) {
    this._socket.emit("inbound-pipe-end", this._id);
    this._socket.conn.once("drain", () => {
      next();
    });
  }
}

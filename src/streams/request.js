import { Writable } from "stream";

export default class Request extends Writable {
  constructor({ id, socket, inbound }) {
    super();
    this._id = id;
    this._socket = socket;
    this._socket.emit("request", id, inbound);
  }

  /* 
  For processing multiple chunks at once.From the Node docs:
  If a stream implementation is capable of processing 
  multiple chunks of data at once, 
  the writable._writev() method should be implemented.
  */
  _writev(data, next) {
    this._socket.emit("inbound-pipes", this.id, data);
    this._socket.conn.once("drain", () => {
      next();
    });
  }

  /*
  This is a method for writing streams as well but
  it gets deprioritized - for _writev (see above) - when a stream contains
  several chunks.
  */
  _write(data, _, next) {
    this._socket, this.emit("inbound-pipe", this._id, data);
    next();
  }
}

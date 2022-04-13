import { Writable } from "stream";

export default class Request extends Writable {
  constructor({ id, socket, inbound }) {
    super();
    this._id = id;
    this._socket = socket;
    this._socket.emit("request", id, inbound);
  }

  _write(data, _, next) {
    this._socket, this.emit("pipe", this._id, data);
    next();
  }
}

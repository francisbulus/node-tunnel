import { Readable } from "stream";

export default class Response extends Readable {
  constructor({ id, socket }) {
    super();
    this._id = id;
    this._socket = socket;
  }
}

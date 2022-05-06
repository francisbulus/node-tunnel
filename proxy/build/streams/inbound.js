"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class Inbound extends stream_1.Writable {
    constructor(id, socket, req) {
        super();
        this.id = id;
        this.socket = socket;
        this.req = req;
        this.socket = socket;
        this.id = id;
        this.socket.emit("request", id, req);
    }
    _write(data, enc, next) {
        this.socket.emit("inbound-pipe", this.id, data);
        this.socket.conn.once("drain", () => {
            next();
        });
    }
    _writev(data, next) {
        this.socket.emit("inbound-pipes", this.id, data);
        this.socket.conn.once("drain", () => {
            next();
        });
    }
    _destroy(err, next) {
        if (!err)
            next();
        this.socket.emit("inbound-pipe-error", this.id, err && err.message);
        this.socket.conn.once("drain", () => {
            next();
        });
        return;
    }
    _final(next) {
        this.socket.emit("inbound-pipe-end", this.id);
        this.socket.conn.once("drain", () => {
            next();
        });
    }
}
exports.default = Inbound;

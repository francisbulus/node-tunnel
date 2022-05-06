"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class Outbound extends stream_1.Writable {
    constructor(id, socket) {
        super();
        this.id = id;
        this.socket = socket;
        this.id = id;
        this.socket = socket;
    }
    _writev(data, next) {
        this.socket.emit("outbound-pipes", this.id, data);
        this.socket.io.engine.once("drain", () => {
            next();
        });
    }
    _write(data, _, next) {
        this.socket.emit("outbound-pipe", this.id, data);
        this.socket.io.engine.once("drain", () => {
            next();
        });
    }
    _final(next) {
        this.socket.emit("outbound-pipe-end", this.id);
        this.socket.io.engine.once("drain", () => {
            next();
        });
    }
    writeHead(statusCode, statusMessage, headers) {
        this.socket.emit("response", this.id, {
            statusCode,
            statusMessage,
            headers,
        });
    }
    _destroy(e, next) {
        if (e) {
            this.socket.emit("outbound-pipe-error", this.id, e && e.message);
            this.socket.io.engine.once("drain", () => {
                next();
            });
            return;
        }
        next();
    }
}
exports.default = Outbound;

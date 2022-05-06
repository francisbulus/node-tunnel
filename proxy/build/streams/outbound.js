"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class Outbound extends stream_1.Duplex {
    constructor(id, socket) {
        super();
        this.id = id;
        this.socket = socket;
        this.socket = socket;
        this.id = id;
        const handlePipe = (id, data) => {
            if (this.id === id) {
                this.push(data);
            }
        };
        const handlePipes = (id, data) => {
            if (this.id === id) {
                data.forEach((chunk) => {
                    this.push(chunk);
                });
            }
        };
        const handleStreamClose = (id, data) => {
            if (this.id !== id)
                return;
            if (data)
                this.push(data);
            this.socket.off("outbound-pipe", handlePipe);
            this.socket.off("outbound-pipes", handlePipes);
            this.socket.off("outbound-pipe-error", handleStreamError);
            this.socket.off("outbound-pipe-end", handleStreamClose);
            this.push(null);
        };
        const handleResponse = (id, data) => {
            if (this.id === id) {
                this.socket.off("request-error", handleBadRequest);
                this.socket.off("response", handleResponse);
                const { statusCode, statusMessage, headers } = data;
                this.emit("response", statusCode, statusMessage, headers);
            }
        };
        const handleBadRequest = (id, error) => {
            if (this.id === id) {
                this.socket.off("response", handleResponse);
                this.socket.off("outbound-pipe", handlePipe);
                this.socket.off("outbound-pipes", handlePipes);
                this.socket.off("outbound-pipe-end", handleStreamClose);
                this.socket.off("outbound-pipe-error", handleStreamError);
                this.socket.off("request-error", handleBadRequest);
                this.emit("proxy-request-error", error);
            }
        };
        const handleStreamError = (id, err) => {
            if (this.id !== id) {
                return;
            }
            this.socket.off("outbound-pipe", handlePipe);
            this.socket.off("outbound-pipes", handlePipes);
            this.socket.off("outbound-pipe-error", handleStreamError);
            this.socket.off("outbound-pipe-end", handleStreamClose);
            this.destroy(new Error(err));
        };
        this.socket.on("response", handleResponse);
        this.socket.on("outbound-pipe", handlePipe);
        this.socket.on("outbound-pipes", handlePipes);
        this.socket.on("outbound-pipe-end", handleStreamClose);
        this.socket.on("request-error", handleBadRequest);
        this.socket.on("outbound-pipe-error", handleStreamError);
    }
    _destroy(error, next) {
        if (error) {
            this.socket.emit("outbound-pipe-error", this.id, error && error.message);
            this.socket.conn.once("drain", () => {
                next(error);
            });
            return;
        }
        next(null);
    }
    _read(size) { }
}
exports.default = Outbound;

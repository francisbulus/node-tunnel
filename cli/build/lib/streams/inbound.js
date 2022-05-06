"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class Inbound extends stream_1.Readable {
    constructor(id, socket) {
        super();
        this.id = id;
        this.socket = socket;
        this.socket = socket;
        this.id = id;
        const handlePipe = (id, data) => {
            if (this.id === id)
                this.push(data);
        };
        const handlePipes = (id, data) => {
            if (this.id === id)
                data.forEach((chunk) => this.push(chunk));
        };
        const handlePipeError = (id, err) => {
            if (this.id === id) {
                this.socket.off("inbound-pipe", handlePipe);
                this.socket.off("inbound-pipes", handlePipe);
                this.socket.off("inbound-error", handlePipeError);
                this.socket.off("inbound-pipe-end", handlePipeEnd);
                this.destroy(new Error(err));
            }
        };
        const handlePipeEnd = (id, data) => {
            if (this.id === id) {
                this.socket.off("inbound-pipe", handlePipe);
                this.socket.off("inbound-pipes", handlePipe);
                this.socket.off("inbound-error", handlePipeError);
                this.socket.off("inbound-pipe-end", handlePipeEnd);
            }
            if (data) {
                this.push(data);
            }
            else {
                this.push(null);
            }
        };
        this.socket.on("inbound-pipe", handlePipe);
        this.socket.on("inbound-pipes", handlePipes);
        this.socket.on("inbound-error", handlePipeError);
        this.socket.on("inbound-pipe-end", handlePipeEnd);
    }
    _read() { }
}
exports.default = Inbound;

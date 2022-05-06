"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.persistConnection = void 0;
const socket_io_client_1 = require("socket.io-client");
const http_1 = __importDefault(require("http"));
const nanoid_1 = require("nanoid");
const inbound_1 = __importDefault(require("../streams/inbound"));
const outbound_1 = __importDefault(require("../streams/outbound"));
let socket;
function persistConnection() {
    setTimeout(() => {
        if (socket && socket.connected) {
            socket.send("ping");
        }
        persistConnection();
    }, 5000);
}
exports.persistConnection = persistConnection;
function connect(config) {
    socket = (0, socket_io_client_1.io)(config.remote, {
        transports: ["websocket"],
    });
    socket.on("connect", () => {
        const room = (0, nanoid_1.nanoid)(5);
        socket.emit("join", room);
        if (socket.connected) {
            console.log(`Send this code "${room}" to the client so they access at https://node-tunnel.herokuapp.com `);
        }
    });
    socket.on("connect_error", (e) => {
        console.error(e.message);
    });
    socket.on("room-confirmation", (msg) => {
        console.log("Aye, we are game.");
    });
    socket.on("request", (id, req) => {
        req.port = config.port;
        const inbound = new inbound_1.default(id, socket);
        const localServerReq = http_1.default.request(req);
        inbound.pipe(localServerReq);
        const handleLocalServerResponse = (res) => {
            localServerReq.off("error", handleLocalServerError);
            const outbound = new outbound_1.default(id, socket);
            outbound.writeHead(res.statusCode, res.statusMessage, res.headers);
            res.pipe(outbound);
        };
        const handleLocalServerError = (err) => {
            localServerReq.off("response", handleLocalServerResponse);
            socket.emit("request-error", id, err && err.message);
            inbound.destroy(err);
        };
        localServerReq.on("response", handleLocalServerResponse);
        localServerReq.on("error", handleLocalServerError);
    });
    persistConnection();
}
exports.connect = connect;

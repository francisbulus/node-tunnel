"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const morgan_1 = __importDefault(require("morgan"));
const server_js_1 = require("./utils/error-handlers/server.js");
const sockets_js_1 = require("./utils/general-helpers/sockets.js");
const server_js_2 = require("./utils/general-helpers/server.js");
const sockets_js_2 = require("./utils/error-handlers/sockets.js");
const cors_1 = __importDefault(require("cors"));
const redis_1 = require("redis");
const crypto_1 = __importDefault(require("crypto"));
const inbound_js_1 = __importDefault(require("./streams/inbound.js"));
const outbound_js_1 = __importDefault(require("./streams/outbound.js"));
const store = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.store = store;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
exports.io = io;
store.on("connect", function () {
    console.log("connected to some rando!");
});
const connToRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    yield store.connect();
});
let access;
connToRedis();
io.on("connection", (socket) => {
    access = socket;
    console.log("access", access);
    socket.once("join", function (room) {
        return __awaiter(this, void 0, void 0, function* () {
            socket.join(room);
            yield store.set(room, socket.id);
            io.to(room).emit("room-confirmation", {
                message: `You've been connected!`,
                joined_at: Date.now(),
            });
        });
    });
    socket.on("message", function (msg) {
        (0, sockets_js_1.handlePing)(msg, socket);
    });
    socket.once("disconnect", function () {
        (0, sockets_js_1.handleSocketClientDisconnect)(socket, access);
    });
    socket.once("error", function () {
        (0, sockets_js_2.handleSocketConnectionError)(socket, store, access);
    });
});
app.use(express_1.default.json());
app.use((0, morgan_1.default)("tiny"));
app.use((0, cors_1.default)());
app.use("/", 
// async (req, res, next) => {
//   checkConnection(req, res, next, store);
// },
(req, res) => {
    const socket = access;
    const id = crypto_1.default.randomUUID();
    const inbound = new inbound_js_1.default(id, socket, {
        method: req.method,
        headers: Object.assign({}, req.headers),
        path: req.url,
    });
    req.once("aborted", function (err, req) {
        (0, server_js_1.handleBadRequestToSocket)(err, req);
    });
    req.once("error", function (err, req) {
        (0, server_js_1.handleBadRequestToSocket)(err, req);
    });
    req.once("finish", () => {
        req.off("aborted", function (err, req) {
            (0, server_js_1.handleBadRequestToSocket)(err, req);
        });
        req.off("error", function (err, req) {
            (0, server_js_1.handleBadRequestToSocket)(err, req);
        });
    });
    req.pipe(inbound);
    const outbound = new outbound_js_1.default(id, socket);
    const handleSocketErrorWrapper = () => {
        (0, server_js_1.handleSocketError)(res, socket);
    };
    outbound.once("proxy-request-error", function () {
        (0, server_js_1.handleRequestError)(res, outbound);
    });
    outbound.once("response", function (statusCode, statusMessage, headers) {
        (0, server_js_2.handleResponse)(statusCode, statusMessage, headers, inbound, res);
    });
    outbound.once("error", handleSocketErrorWrapper);
    outbound.pipe(res);
    res.once("close", () => {
        socket.off("close", handleSocketErrorWrapper);
        outbound.off("error", handleSocketErrorWrapper);
    });
    socket.once("close", handleSocketErrorWrapper);
});
exports.default = server;

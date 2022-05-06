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
exports.checkConnection = exports.handleSocketClientDisconnect = exports.handlePing = void 0;
const sockets_js_1 = require("../error-handlers/sockets.js");
const proxy_addr_1 = __importDefault(require("proxy-addr"));
const server_js_1 = require("../../server.js");
const server_js_2 = require("./server.js");
const handlePing = (msg, socket) => {
    if (msg !== "ping")
        return;
    socket.send("pong");
};
exports.handlePing = handlePing;
const handleSocketClientDisconnect = (socket, access) => __awaiter(void 0, void 0, void 0, function* () {
    yield server_js_1.store.del(access);
    socket.off("error", sockets_js_1.handleSocketConnectionError);
    socket.off("message", exports.handlePing);
});
exports.handleSocketClientDisconnect = handleSocketClientDisconnect;
const checkConnection = (req, res, next, store) => __awaiter(void 0, void 0, void 0, function* () {
    const clientIp = (0, proxy_addr_1.default)(req, (proxy) => proxy);
    const roomAccessFromInput = (0, server_js_2.getToken)(req);
    const roomAccessFromSession = yield store.get(clientIp);
    let socket;
    const access = roomAccessFromSession || roomAccessFromInput;
    if (!access) {
        res.sendFile("index.html", { root: "src/" + "public" }, (err) => {
            if (err) {
                res.end(500);
            }
            next();
        });
    }
    else {
        const socketId = yield store.get(access);
        socket = server_js_1.io.sockets.sockets.get(socketId);
        if (!roomAccessFromSession && socket)
            store.set(clientIp, access);
        if (!socket) {
            yield store.del(access);
            yield store.del(clientIp);
            res
                .status(404)
                .send("No socket connection found for the given room access key");
            return;
        }
        res.locals.socket = socket;
        next();
    }
});
exports.checkConnection = checkConnection;

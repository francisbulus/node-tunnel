"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequestError = exports.handleSocketError = exports.handleBadRequestToSocket = void 0;
const server_1 = require("../general-helpers/server");
const handleBadRequestToSocket = (err, request) => {
    request.destroy(new Error(err));
};
exports.handleBadRequestToSocket = handleBadRequestToSocket;
const handleSocketError = (res, socket) => {
    res.off("close", () => {
        socket.once("disonnect", exports.handleSocketError);
    });
    res.end(500);
};
exports.handleSocketError = handleSocketError;
const handleRequestError = (res, outbound) => {
    outbound.off("response", server_1.handleResponse);
    outbound.destroy();
    res.end(502);
};
exports.handleRequestError = handleRequestError;

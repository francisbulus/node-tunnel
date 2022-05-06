"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = exports.handleResponse = void 0;
const server_js_1 = require("../error-handlers/server.js");
const handleResponse = (statusCode, statusMessage, headers, inbound, res) => {
    inbound.off("proxy-request-error", server_js_1.handleRequestError);
    res.writeHead(statusCode, statusMessage, headers);
};
exports.handleResponse = handleResponse;
const getToken = (req) => {
    if (req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer") {
        return req.headers.authorization.split(" ")[1];
    }
    else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
};
exports.getToken = getToken;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgumentsIntoOptions = void 0;
const arg_1 = __importDefault(require("arg"));
function parseArgumentsIntoOptions(rawArgs) {
    const args = (0, arg_1.default)({
        "-p": "--port",
        "--help": Boolean,
        "--version": Boolean,
        "--port": Number,
    }, {
        argv: rawArgs.slice(2),
    });
    if (!args["--port"]) {
        console.error("-p flag not provided");
        process.exit(1);
    }
    return {
        port: args["--port"] || false,
    };
}
exports.parseArgumentsIntoOptions = parseArgumentsIntoOptions;

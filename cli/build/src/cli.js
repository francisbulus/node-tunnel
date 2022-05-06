"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const dotenv_1 = require("dotenv");
const args_1 = require("../lib/helpers/args");
const socket_1 = require("../lib/helpers/socket");
(0, dotenv_1.config)();
async function cli(args) {
    let options = (0, args_1.parseArgumentsIntoOptions)(args);
    if (options.port) {
        options["remote"] = "http://localhost:1337";
        (0, socket_1.connect)(options);
    }
    else {
        console.error("No port provided!");
        process.exit(1);
    }
}
exports.cli = cli;
//

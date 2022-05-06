import { config } from "dotenv";
import { parseArgumentsIntoOptions } from "../lib/helpers/args";
import { connect } from "../lib/helpers/socket";

config();

export async function cli(args: string[]): Promise<void> {
  let options = parseArgumentsIntoOptions(args);
  if (options.port) {
    options["remote"] = "http://localhost:1337";
    connect(options);
  } else {
    console.error("No port provided!");
    process.exit(1);
  }
}

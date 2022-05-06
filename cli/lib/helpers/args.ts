import arg from "arg";
import { ComputedArguments } from "../types";

export function parseArgumentsIntoOptions(
  rawArgs: string[]
): ComputedArguments {
  const args = arg(
    {
      "-p": "--port",
      "--help": Boolean,
      "--version": Boolean,
      "--port": Number,
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  if (!args["--port"]) {
    console.error("-p flag not provided");
    process.exit(1);
  }

  return {
    port: args["--port"] || false,
  };
}

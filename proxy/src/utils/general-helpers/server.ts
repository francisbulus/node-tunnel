import { handleRequestError } from "../error-handlers/server.js";
import { ResponseResolver, Req } from "../types.js";

export const handleResponse: ResponseResolver = (
  statusCode,
  statusMessage,
  headers,
  inbound,
  res
) => {
  inbound.off("proxy-request-error", handleRequestError);
  res.writeHead(statusCode, statusMessage, headers);
};

export const getToken = (req: Req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};

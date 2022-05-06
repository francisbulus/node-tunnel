import { handleRequestError } from "../error-handlers/server.js";

export const handleResponse = (
  statusCode,
  statusMessage,
  headers,
  inbound,
  res
) => {
  inbound.off("proxy-request-error", handleRequestError);
  res.writeHead(statusCode, statusMessage, headers);
};

export const getToken = (req) => {
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

import { handleRequestError } from "../error-handlers/server.js";

export const handleResponse = (statusCode, statusMessage, headers, inbound, res) => {
  inbound.off("requestError", handleRequestError);
  res.writeHead(statusCode, statusMessage, headers);
};
//# sourceMappingURL=server.js.map
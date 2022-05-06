import { handleResponse } from "../general-helpers/server.js";

export const handleBadRequestToSocket = (err, request) => {
  request.destroy(new Error(err));
};

export const handleSocketError = (res, socket) => {
  res.off("close", () => {
    socket.once("disonnect", handleSocketError);
  });
  res.end(500);
};

export const handleRequestError = (res, outbound) => {
  outbound.off("response", handleResponse);
  outbound.destroy();
  res.end(502);
};

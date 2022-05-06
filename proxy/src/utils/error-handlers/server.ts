import { handleResponse } from "../general-helpers/server";
import { Res, Req, Socket } from "../types";

export const handleBadRequestToSocket = (err: string, request: Req) => {
  request.destroy(new Error(err));
};

export const handleSocketError = (res: Res, socket: Socket) => {
  res.off("close", () => {
    socket.once("disonnect", handleSocketError);
  });
  res.end(500);
};

export const handleRequestError = (res: Res, outbound: any) => {
  outbound.off("response", handleResponse);
  outbound.destroy();
  res.end(502);
};

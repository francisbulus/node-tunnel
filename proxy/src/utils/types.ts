import { Request, Response } from "express";
import { Socket as SocketInstance } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export type Socket = SocketInstance<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export interface StreamHandler {
  (id: number, data: any): void;
}

export type StreamCallback = (error?: Error) => void;

export type Req = Request;
export type Res = Response;

export interface ResponseResolver {
  (
    statusCode: number,
    statusMessage: string,
    headers: any,
    inbound: NodeJS.WritableStream,
    res: Response
  ): void;
}

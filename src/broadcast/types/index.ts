import { Server, Socket } from "socket.io";

type ServerToClientEvents = {
  notification: (...payload: any[]) => void;
};

type ClientToServerEvents = {
  subscribeTo: (room: string) => void;
  unsubscribeFrom: (room: string) => void;
};

type InterServerEvents = Record<string, never>;

type SocketData = Record<string, never>;

export type BroadcastIOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
export type BroadcastIOSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
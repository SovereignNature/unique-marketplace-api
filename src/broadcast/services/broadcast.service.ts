import { Injectable, Logger } from "@nestjs/common";

import { BroadcastIOServer, BroadcastIOSocket } from "../types";

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  public server: BroadcastIOServer = null;

  // todo - move to config or implement some validation logic
  public maxRoomsPerSocket = 100;

  init(server: BroadcastIOServer): void {
    this.server = server;
    this.server.on('connection', this.handleSocketConnection.bind(this));

    this.logger.debug(`initialised`);
  }

  private handleSocketConnection(socket: BroadcastIOSocket): void {
    this.logger.debug(`Socket ${socket.id} connected`);

    socket.on('subscribeTo', (room) => {
      this.logger.debug(`Socket ${socket.id} subscribeTo ${room}`)

      if (socket.rooms.size <= this.maxRoomsPerSocket) {
        socket.join(room);
      }
    });

    socket.on('unsubscribeFrom', (room) => {
      this.logger.debug(`Socket ${socket.id} unsubscribeFrom ${room}`)

      socket.leave(room);
    });

    socket.on('disconnecting', (reason) => {
      this.logger.debug(`Socket ${socket.id} disconnecting; Reason ${reason}`)
    });

    socket.on('disconnect', (reason) => {
      this.logger.debug(`Socket ${socket.id} disconnected; Reason ${reason}`)
    });
  }

  sendNotification(room: string | string[], ...payload: any[]) {
    this.logger.debug(`notification to "${room}": ${JSON.stringify(payload)}`);

    this.server.to(room).emit('notification', ...payload);
  }
}
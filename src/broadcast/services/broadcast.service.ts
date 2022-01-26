import { Injectable, Logger } from "@nestjs/common";

import { BroadcastIOServer, BroadcastIOSocket } from "../types";
import { Auction, Bid } from "../../auction/types";

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  public server: BroadcastIOServer = null;

  init(server: BroadcastIOServer): void {
    this.server = server;
    this.server.on('connection', this.handleSocketConnection.bind(this));

    this.logger.debug(`initialised`);
  }

  private handleSocketConnection(socket: BroadcastIOSocket): void {
    this.logger.debug(`Socket ${socket.id} connected`);

    socket.on('subscribeToAuction',async (auctionId) => {
      this.logger.debug(`Socket ${socket.id} subscribeTo ${auctionId}`)

      socket.join(`auction-${auctionId}`);
    });

    socket.on('unsubscribeFromAuction',async (auctionId) => {
      this.logger.debug(`Socket ${socket.id} unsubscribeFrom ${auctionId}`)

      socket.leave(`auction-${auctionId}`);
    });

    socket.on('disconnecting', (reason) => {
      this.logger.debug(`Socket ${socket.id} disconnecting; Reason ${reason}`)
    });

    socket.on('disconnect', (reason) => {
      this.logger.debug(`Socket ${socket.id} disconnected; Reason ${reason}`)
    });
  }

  sendAuctionStarted(auction: Auction): void {
    this.logger.debug(`auctionStarted - ${JSON.stringify(auction)}`);

    this.server.of('/').emit('auctionStarted', auction);
  }

  sendBidPlaced(bid: Bid): void {
    this.logger.debug(`bidPlaced - ${JSON.stringify(bid)}`);

    this.server.of('/').emit('bidPlaced', bid);
  }
}
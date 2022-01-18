import { INestApplication } from '@nestjs/common';
import * as SocketIOClient from 'socket.io-client';

import { initApp } from './data';
import { BroadcastService } from "../src/broadcast/services/broadcast.service";

describe('Broadcast', () => {
    let app: INestApplication;
    let broadcastService: BroadcastService;
    let clientSocket: SocketIOClient.Socket;

    beforeAll(async () => {
      app = await initApp();
      await app.init();

      broadcastService = app.get<BroadcastService>(BroadcastService);

      const { address, port } = app.getHttpServer().listen().address();
      clientSocket = SocketIOClient.connect(`http://[${address}]:${port}`);

      await new Promise((resolve) => {
        clientSocket.once('connect', () => resolve(true))
      });
    });

    afterAll(async () => {
        await app.close();
    });

    it('notifications',  (done) => {
      const rooms = {
        first: {
          name: 'firstRoom',
          payload: [{ foo: 'first' }, 'bar'],
        },
        second: {
          name: 'secondRoom',
          payload: [{ foo: 'second' }, 'bar'],
        },
      };

      const intervals = setInterval(() => {
        broadcastService.sendNotification(rooms.first.name, ...rooms.first.payload);
        broadcastService.sendNotification(rooms.second.name, ...rooms.second.payload);
      }, 100);

      clientSocket.on('notification', (...payload) => {
        clearInterval(intervals);

        expect(payload).toEqual(rooms.second.payload);

        done();
      });

      clientSocket.emit('subscribeTo', rooms.second.name);
    }, 10000);
});

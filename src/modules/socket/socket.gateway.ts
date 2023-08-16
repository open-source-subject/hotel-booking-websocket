import { OnModuleInit, Request, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsGuard } from 'src/common/guards/websocket.guard';

import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { BACKEND_SERVICE } from 'src/constants/base.constant';
import { JWT_KEY } from 'src/constants/jwt.constant';
import { HttpService } from '../http/http.service';
import { SocketService } from './socket.service';

@WebSocketGateway({ namespace: 'booking' })
export class SocketGateway implements OnModuleInit {
  constructor(
    private readonly socketService: SocketService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  @WebSocketServer() public server: Server;

  afterInit(server: Server) {
    this.socketService.socket = server;
  }

  // @UseGuards(WsGuard)
  async handleConnection(client: Socket, @Request() req) {
    // console.log(req['user']);
  }

  onModuleInit() {
    this.server.on('connection', async (socket) => {
      let bearerToken =
        socket.handshake.auth.token || socket.handshake.headers.authorization;
      bearerToken = bearerToken?.split(' ')[1];
      if (!bearerToken) {
        this.server.disconnectSockets();
        return;
      }
      try {
        const result = await this.httpService.post(
          `${BACKEND_SERVICE}/api/v1/auth/verify-token`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            params: {
              token: bearerToken,
            },
            body: {},
          },
        );
        console.log('user connection');
      } catch (err) {
        console.log(err);
      }

      // socket.join(payload.id.toString());
    });
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('check-in')
  async checkIn(@MessageBody() data: any, @Request() req) {
    console.log(data);
    console.log(`Bearer ${req['token']}`);
    try {
      const checkIn = await this.httpService.post(
        `${BACKEND_SERVICE}/api/v1/booking/create`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${req['token']}`,
          },
          params: {},
          body: data,
        },
      );
      if (checkIn.data?.status === 'SUCCESS') {
        const result = checkIn.data;
        this.server.emit('receive-check-in', result);
      }
    } catch (err) {
      console.log(err);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('check-out')
  async checkOut(@MessageBody() data: any, @Request() req) {
    const { bookingId } = data;
    const checkOut = await this.httpService.post(
      `${BACKEND_SERVICE}/api/v1/booking/check-out/${bookingId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${req['token']}`,
        },
        params: {},
        body: {},
      },
    );
    this.server.emit('receive-check-out', checkOut);
  }

  @SubscribeMessage('test')
  async test(@MessageBody() data: any) {
    console.log(data);
  }
}

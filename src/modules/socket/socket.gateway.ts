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

@WebSocketGateway({ namespace: 'room' })
export class SocketGateway implements OnModuleInit {
  constructor(
    private readonly socketService: SocketService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  // headers: {
  //   'Content-Type': 'application/json',
  //   Authorization: 'JWT fefege...',
  // },

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
      console.log('init');

      const ans = await this.httpService.post(
        `${BACKEND_SERVICE}/api/v1/auth/login`,
        {
          headers: {},
          params: {},
          body: {
            emailOrPhone: 'admin@gmail.com',
            password: 'admin',
          },
        },
      );
      console.log(ans);

      let bearerToken =
        socket.handshake.auth.token || socket.handshake.headers.authorization;
      bearerToken = bearerToken?.split(' ')[1];
      if (!bearerToken) {
        this.server.disconnectSockets();
        return;
      }
      const payload = await this.jwtService.verifyAsync(bearerToken, {
        secret: JWT_KEY,
      });
      console.log('join ' + payload.id);
      socket.join(payload.id.toString());
    });
  }

  // chat realtime
  @UseGuards(WsGuard)
  @SubscribeMessage('send-message')
  async chatMesage(@MessageBody() data: any, @Request() req) {
    const { receiverId, ...createMessageDto } = data;

    // this.server.emit('receive-message', newMessage);
  }
}

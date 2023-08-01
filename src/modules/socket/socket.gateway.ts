import { OnModuleInit, Request, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsGuard } from 'src/common/guards/websocket.guard';
import { ACCESS_TOKEN_SECRET_KEY } from 'src/constants';
import { TokenHelper } from 'src/helpers';

import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { MessagesService } from '../messages/messages.service';

import { SocketService } from './socket.service';

@WebSocketGateway({ namespace: 'room' })
export class SocketGateway implements OnModuleInit {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatRoomsService: ChatRoomsService,
    private socketService: SocketService,
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
      let bearerToken = socket.handshake.auth.token || socket.handshake.headers.authorization;
      bearerToken = bearerToken?.split(' ')[1];
      if(!bearerToken) {
        this.server.disconnectSockets();
        return;
      }
      const payload: any = await TokenHelper.verify(
        bearerToken,
        ACCESS_TOKEN_SECRET_KEY,
      );
      console.log('join ' + payload.id);
      socket.join(payload.id.toString());
    });
  }

  // chat realtime
  @UseGuards(WsGuard)
  @SubscribeMessage('send-message')
  async chatMesage(@MessageBody() data: any, @Request() req) {
    const { receiverId, ...createMessageDto } = data;
    createMessageDto['userId'] = req['user'].id;
    const newMessage = await this.messagesService.createMessage(
      createMessageDto,
    );
    if (!newMessage) {
      this.server.emit('error');
    } else {
      const chatRoom = await this.chatRoomsService.getDetailByProfile(
        createMessageDto.roomId,
        receiverId,
      );
      this.server.emit('receive-chat-room', chatRoom);
      this.server.emit('receive-message', newMessage);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('update-message')
  async updateMessage(@MessageBody() data: any, @Request() req) {
    const { messageId, receiverId, ...updateMessageDto } = data;
    updateMessageDto['userId'] = req['user'].id;
    const message = await this.messagesService.updateMessage(
      messageId,
      updateMessageDto,
    );
    if (!message) {
      this.server.emit('error');
    } else {
      this.server.emit('receive-message', message);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('delete-message')
  async deleteMessage(@MessageBody() data: any, @Request() req) {
    const { roomId, messageId, receiverId } = data;
    const message = await this.messagesService.deleteMessage(messageId, {
      userId: req['user'].id,
      roomId: roomId,
    });
    if (!message) {
      this.server.emit('error');
    } else {
      this.server.emit('receive-message-after-deleting', message);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: any, @Request() req) {
    console.log('typing');
  }

  // noti realtime
  // @UseGuards(WsGuard)
  // @SubscribeMessage('delete-message')
  // async (@MessageBody() data: any, @Request() req) {
  //   const { roomId, messageId, receiverId } = data;
  //   const message = await this.messagesService.deleteMessage(messageId, {
  //     userId: req['user'].id,
  //     roomId: roomId,
  //   });
  //   if (!message) {
  //     this.server.emit('error');
  //   } else {
  //     this.server.emit('receive-message', message);
  //   }
  // }
}

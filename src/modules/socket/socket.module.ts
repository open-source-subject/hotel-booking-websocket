import { Global, Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '../http/http.module';
import { SocketService } from './socket.service';

@Global()
@Module({
  imports: [JwtModule, HttpModule],
  controllers: [],
  providers: [SocketService],
  exports: [SocketService],
})
export class SocketModule {}

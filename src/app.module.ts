import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JWT_KEY } from './constants/jwt.constant';
import { SocketGateway } from './modules/socket/socket.gateway';
import { SocketModule } from './modules/socket/socket.module';
import { HttpModule } from './modules/http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: JWT_KEY,
      signOptions: { expiresIn: '60s' },
    }),
    SocketModule,
    HttpModule,
  ],
  controllers: [],
  providers: [SocketGateway],
})
export class AppModule {}

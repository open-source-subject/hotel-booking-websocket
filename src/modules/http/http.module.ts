import { Global, Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { HttpService } from './http.service';

@Global()
@Module({
  imports: [JwtModule],
  controllers: [],
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}

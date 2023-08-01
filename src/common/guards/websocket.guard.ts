import { CanActivate, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_KEY } from 'src/constants/jwt.constant';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: any): Promise<boolean | any> {
    const request = context.switchToHttp().getRequest();

    let bearerToken =
      context.args[0].handshake.auth.token ||
      context.args[0].handshake.headers.authorization;

    bearerToken = bearerToken?.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(bearerToken, {
        secret: JWT_KEY,
      });

      return new Promise((resolve, reject) => {
        // return this.userService.findById(payload.id).then((user) => {
        //   if (user && user.client === EUserType.ADMIN) {
        //     request['user'] = user;
        //     resolve(user);
        //   } else {
        //     reject(false);
        //   }
        // });
      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}

import { CanActivate, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BACKEND_SERVICE } from 'src/constants/base.constant';
import { JWT_KEY } from 'src/constants/jwt.constant';
import { HttpService } from 'src/modules/http/http.service';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  async canActivate(context: any): Promise<boolean | any> {
    const request = context.switchToHttp().getRequest();

    let bearerToken =
      context.args[0].handshake.auth.token ||
      context.args[0].handshake.headers.authorization;

    bearerToken = bearerToken?.split(' ')[1];
    try {
      const verifyToken = await this.httpService.post(
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
      console.log(verifyToken.data);

      return new Promise((resolve, reject) => {
        return this.httpService
          .post(`${BACKEND_SERVICE}/api/v1/auth/verify-token`, {
            headers: {
              'Content-Type': 'application/json',
            },
            params: {
              token:
                'gaeyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI4NGM0MTQxNi0yM2QyLTRkYzItODM5OS1lOTFjMmJjMWVjM2YiLCJpYXQiOjE2OTE5MTQ3MjYsImV4cCI6MTY5MTkzNjMyNn0.DlalkqcBBATyRHGHRDWL34XPbax9dOPnIbAkZLl0d0w',
            },
            body: {},
          })
          .then((result) => {
            if (result.data.status === 'SUCCESS') {
              resolve(result.data);
            }
            reject(false);
          })
          .catch((error) => {
            console.log(error);
            reject(false);
          });
      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}

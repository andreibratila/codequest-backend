import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private cookieName: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.cookieName = configService.get('cookieName');
  }
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const cookie = request.cookies[this.cookieName];

    if (!cookie) {
      throw new UnauthorizedException('Token not found!');
    }

    try {
      const decoded = this.jwtService.verify(cookie);
      request.jwt = decoded;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Token is not valid!');
    }
  }
}

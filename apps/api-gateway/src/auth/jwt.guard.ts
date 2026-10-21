import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppException, ErrorCode } from '@microservices-shop/shared';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (
      typeof authorization !== 'string' ||
      !authorization.startsWith('Bearer ')
    ) {
      throw new AppException(
        ErrorCode.AUTH_INVALID_TOKEN,
        'Токен авторизации отсутствует или имеет неверный формат',
        401,
      );
    }

    const token = authorization.slice(7);

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch {
      throw new AppException(
        ErrorCode.AUTH_INVALID_TOKEN,
        'Токен недействителен или срок его действия истёк',
        401,
      );
    }
  }
}

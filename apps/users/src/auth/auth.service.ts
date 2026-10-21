import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/users.service.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RpcException } from '@nestjs/microservices';
import * as microservices from '@nestjs/microservices';
import { AppException, ErrorCode } from '@microservices-shop/shared';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  private rpcError(
    code: ErrorCode,
    message: string,
    statusCode: number,
  ): RpcException {
    return new RpcException(
      JSON.stringify({
        code,
        message,
        statusCode,
      }),
    );
  }

  private async checkMail(registerDto: RegisterDto) {
    const mailCheck = await this.userService.findByEmail(registerDto.email);
    if (mailCheck) {
      throw this.rpcError(
        ErrorCode.USER_EMAIL_EXISTS,
        'Пользователь с таким email уже существует',
        409,
      );
    }
  }
  private validateRegisterData(dto: RegisterDto) {
    if (
      typeof dto.email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())
    ) {
      throw this.rpcError(
        ErrorCode.USER_INVALID_DATA,
        'Некорректный email',
        400,
      );
    }

    if (typeof dto.name !== 'string' || dto.name.trim().length === 0) {
      throw this.rpcError(
        ErrorCode.USER_INVALID_DATA,
        'Имя не может быть пустым',
        400,
      );
    }
    if (dto.name.trim().length < 4) {
      throw this.rpcError(
        ErrorCode.USER_INVALID_DATA,
        'Имя должно быть больше 4х символов',
        400,
      );
    }

    if (typeof dto.password !== 'string' || dto.password.length < 4) {
      throw this.rpcError(
        ErrorCode.USER_INVALID_DATA,
        'Пароль должен содержать минимум 4 символов',
        400,
      );
    }
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw this.rpcError(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Неверный email или пароль',
        401,
      );
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw this.rpcError(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Неверный email или пароль',
        401,
      );
    }
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async register(registerDto: RegisterDto) {
    this.validateRegisterData(registerDto);
    await this.checkMail(registerDto);
    const { email, name, password } = registerDto;
    const newUser = await this.userService.createUser({
      email,
      password,
      name,
    });
    return newUser;
  }
}

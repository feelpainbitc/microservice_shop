import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { OnModuleInit } from '@nestjs/common';

import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoginDto, RegisterDto } from '@microservices-shop/dto';

import * as microservices from '@nestjs/microservices';

interface UsersService {
  Register(data: { name: string; email: string; password: string }): any;

  Login(data: { email: string; password: string }): any;
}

@Controller('auth')
export class AuthController implements OnModuleInit {
  private usersService: UsersService;

  constructor(
    @Inject('USERS_PACKAGE')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.usersService = this.client.getService<UsersService>('UsersService');
  }

  @Post('register')
  @Post('signup')
  @ApiOperation({ summary: 'Зарегестрироваться' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Пользователь зарегестрирован' })
  register(
    @Body()
    data: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    return this.usersService.Register(data);
  }

  @Post('login')
  @ApiOperation({ summary: 'Авторизоваться' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Пользователь авторизован + токен' })
  login(
    @Body()
    data: {
      email: string;
      password: string;
    },
  ) {
    return this.usersService.Login(data);
  }
}

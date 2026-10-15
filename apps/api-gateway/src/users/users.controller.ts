import {
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { OnModuleInit } from '@nestjs/common';


import * as microservices from '@nestjs/microservices';

interface UsersService {
  Register(data: {
    name: string;
    email: string;
    password: string;
  }): any;

  Login(data: {
    email: string;
    password: string;
  }): any;
}

@Controller('auth')
export class AuthController implements OnModuleInit {
  private usersService: UsersService;

  constructor(
    @Inject('USERS_PACKAGE')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.usersService =
      this.client.getService<UsersService>('UsersService');
  }

  @Post('register')
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
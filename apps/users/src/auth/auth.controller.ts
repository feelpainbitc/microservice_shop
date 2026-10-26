import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto,RegisterDto } from '@microservices-shop/dto';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('UsersService', 'Register')
  async register(data: RegisterDto) {
    const user = await this.authService.register(data);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  @GrpcMethod('UsersService', 'Login')
  async login(data: LoginDto) {
    const accessToken = await this.authService.login(data);

    return { accessToken };
  }

  @Post('register')
  registerUser(@Body() registerDto: RegisterDto) {
    console.log(`REGISTER DTO::: ${registerDto}`);
    return this.authService.register(registerDto);
  }

  @Post('login')
  loginUser(@Body() loginDto: LoginDto) {
    console.log(`LOGIN DTO::: ${loginDto}`);
    return this.authService.login(loginDto);
  }
}

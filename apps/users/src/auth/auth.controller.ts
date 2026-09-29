import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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

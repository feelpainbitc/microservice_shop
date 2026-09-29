import { IsEmail, MinLength, MaxLength, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MinLength(5)
  email: string;

  @MinLength(4)
  @MaxLength(255)
  name: string;

  @MinLength(4)
  @MaxLength(255)
  password: string;
}

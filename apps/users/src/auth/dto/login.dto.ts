import { IsEmail, MinLength, MaxLength, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MinLength(5)
  email: string;

  @MinLength(4)
  @MaxLength(255)
  password: string;
}

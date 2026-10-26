import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "user@example.com", minLength: 5 })
  @IsEmail()
  @MinLength(5)
  email: string;

  @ApiProperty({ example: "StrongPassword123", minLength: 4, maxLength: 255 })
  @IsString()
  @MinLength(4)
  @MaxLength(255)
  password: string;
}

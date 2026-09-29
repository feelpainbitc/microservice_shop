import {IsEmail,MinLength,MaxLength} from 'class-validator'

export class CreateUserDto{
    @MinLength(3)
    name:string

    @MinLength(3)
    password:string

    @MinLength(3)
    @IsEmail()
    email:string
}
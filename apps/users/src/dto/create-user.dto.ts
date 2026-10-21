import {IsEmail,MinLength,MaxLength} from 'class-validator'

export class CreateUserDto{
    @MinLength(4)
    name:string

    @MinLength(4)
    password:string

    @MinLength(3)
    @IsEmail()
    email:string
}
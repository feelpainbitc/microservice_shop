import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async findByEmail(email: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async createUser(user: CreateUserDto) {
    const saltRounds = 10;
    let { name, email, password } = user;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });
    return newUser;
  }

  async updateUser(params: { id: number }, body: { user: any }) {
    const { id } = params;
    let data = body;
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
    return updatedUser;
  }

  async deleteUser(params:{id:number}){
    const {id} = params;
    const deletedUser = await this.prisma.user.delete({
      where:{id}
    })
    return deletedUser;
  }
}

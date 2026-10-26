
import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service.js';
import { UserService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const userServiceMock = {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
  };

  const jwtServiceMock = {
    sign: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    service = new AuthService(
      userServiceMock as unknown as UserService,
      jwtServiceMock as unknown as JwtService,
    );
  });

  describe('register', () => {
    const dto = {
      name: 'Alex User',
      email: 'alex@example.com',
      password: 'pass1234',
    };

    it('should register a new user', async () => {
      const createdUser = {
        id: 1,
        name: dto.name,
        email: dto.email,
      };

      userServiceMock.findByEmail.mockResolvedValue(null);
      userServiceMock.createUser.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(userServiceMock.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });

    it('should reject registration when email already exists', async () => {
      userServiceMock.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      await expect(service.register(dto)).rejects.toBeInstanceOf(RpcException);

      expect(userServiceMock.createUser).not.toHaveBeenCalled();
    });

    it.each([
      ['invalid email', { ...dto, email: 'invalid-email' }],
      ['empty email', { ...dto, email: '' }],
      ['empty name', { ...dto, name: '   ' }],
      ['short name', { ...dto, name: 'Bob' }],
      ['short password', { ...dto, password: '123' }],
      ['non-string email', { ...dto, email: 123 }],
      ['non-string name', { ...dto, name: 123 }],
      ['non-string password', { ...dto, password: 123 }],
    ])('should reject invalid data: %s', async (_case, invalidDto) => {
      await expect(service.register(invalidDto as any)).rejects.toBeInstanceOf(
        RpcException,
      );

      expect(userServiceMock.findByEmail).not.toHaveBeenCalled();
      expect(userServiceMock.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = {
      email: 'alex@example.com',
      password: 'pass1234',
    };

    const user = {
      id: 1,
      email: dto.email,
      passwordHash: 'hashed-password',
    };

    it('should return a JWT when credentials are valid', async () => {
      userServiceMock.findByEmail.mockResolvedValue(user);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jwtServiceMock.sign.mockReturnValue('jwt-token');

      const result = await service.login(dto);

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        user.passwordHash,
      );
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result).toBe('jwt-token');
    });

    it('should reject login when user does not exist', async () => {
      userServiceMock.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toBeInstanceOf(RpcException);

      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('should reject login when password is incorrect', async () => {
      userServiceMock.findByEmail.mockResolvedValue(user);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login(dto)).rejects.toBeInstanceOf(RpcException);

      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });
  });
});

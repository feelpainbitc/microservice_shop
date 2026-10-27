import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './users.controller.js';

describe('AuthController', () => {
  const registerResult = {
    id: 1,
    name: 'Dima',
    email: 'dima@example.com',
  };

  const loginResult = {
    accessToken: 'test-jwt-token',
  };

  const usersService = {
    Register: vi.fn(),
    Login: vi.fn(),
  };

  const client = {
    getService: vi.fn(),
  };

  let controller: AuthController;

  beforeEach(() => {
    vi.clearAllMocks();

    usersService.Register.mockReturnValue(registerResult);
    usersService.Login.mockReturnValue(loginResult);

    client.getService.mockReturnValue(usersService);

    controller = new AuthController(client as never);
    controller.onModuleInit();
  });

  describe('onModuleInit', () => {
    it('should initialize UsersService from gRPC client', () => {
      expect(client.getService).toHaveBeenCalledWith('UsersService');
    });
  });

  describe('register', () => {
    it('should pass registration data to UsersService', () => {
      const dto = {
        name: 'Dima',
        email: 'dima@example.com',
        password: 'StrongPassword123!',
      };

      controller.register(dto);

      expect(usersService.Register).toHaveBeenCalledWith(dto);
      expect(usersService.Register).toHaveBeenCalledTimes(1);
    });

    it('should return the registration result', () => {
      const dto = {
        name: 'Dima',
        email: 'dima@example.com',
        password: 'StrongPassword123!',
      };

      const result = controller.register(dto);

      expect(result).toEqual(registerResult);
    });
  });

  describe('login', () => {
    it('should pass credentials to UsersService', () => {
      const dto = {
        email: 'dima@example.com',
        password: 'StrongPassword123!',
      };

      controller.login(dto);

      expect(usersService.Login).toHaveBeenCalledWith(dto);
      expect(usersService.Login).toHaveBeenCalledTimes(1);
    });

    it('should return the authentication result', () => {
      const dto = {
        email: 'dima@example.com',
        password: 'StrongPassword123!',
      };

      const result = controller.login(dto);

      expect(result).toEqual(loginResult);
    });
  });
});

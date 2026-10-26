import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { UserService } from './users.service.js';

describe('UserService', () => {
  let service: UserService;

  const prismaMock = {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    service = new UserService(prismaMock as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, name: 'Alex User', email: 'alex@example.com' },
        { id: 2, name: 'John User', email: 'john@example.com' },
      ];

      prismaMock.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should propagate database errors', async () => {
      prismaMock.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const user = { id: 1, name: 'Alex User', email: 'alex@example.com' };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.findById(1);

      expect(result).toEqual(user);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should return null when the user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 999 } }),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 1, email: 'alex@example.com' };

      prismaMock.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('alex@example.com');

      expect(result).toEqual(user);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'alex@example.com' },
        }),
      );
    });

    it('should return null when the email is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('missing@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should hash the password and create a user', async () => {
      const dto = {
        name: 'Alex User',
        email: 'alex@example.com',
        password: 'plain-password',
      };
      const createdUser = {
        id: 1,
        name: dto.name,
        email: dto.email,
        passwordHash: 'hashed-password',
      };

      vi.spyOn(bcrypt, 'hash').mockImplementation(
        async () => 'hashed-password',
      );
      prismaMock.user.create.mockResolvedValue(createdUser);

      const result = await service.createUser(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash: 'hashed-password',
        },
      });
      expect(result).toEqual(createdUser);
    });

    it('should propagate password hashing errors', async () => {
      vi.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('Hashing failed'));

      await expect(
        service.createUser({
          name: 'Alex User',
          email: 'alex@example.com',
          password: 'plain-password',
        }),
      ).rejects.toThrow('Hashing failed');

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update a user by ID', async () => {
      const body = { name: 'Updated User' };
      const updatedUser = {
        id: 1,
        name: 'Updated User',
        email: 'alex@example.com',
      };

      prismaMock.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser({ id: 1 }, { user: body });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { user: body },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should propagate database errors', async () => {
      prismaMock.user.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.updateUser({ id: 1 }, { user: { name: 'Updated User' } }),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      const deletedUser = { id: 1, email: 'alex@example.com' };

      prismaMock.user.delete.mockResolvedValue(deletedUser);

      const result = await service.deleteUser({ id: 1 });

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(deletedUser);
    });

    it('should propagate database errors', async () => {
      prismaMock.user.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteUser({ id: 1 })).rejects.toThrow(
        'Delete failed',
      );
    });
  });
});

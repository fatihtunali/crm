import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let configService: any;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config: Record<string, any> = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '24h',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
      tenantId: 1,
      isActive: true,
      passwordHash: 'hashed-password',
      tenant: {
        id: 1,
        name: 'Test Tenant',
        code: 'TEST',
        isActive: true,
      },
    };

    it('should return tokens with valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser as any);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue(mockUser as any);

      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error with invalid password', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser as any);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with non-existent email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update lastLoginAt timestamp', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser as any);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue(mockUser as any);
      mockJwtService.sign.mockReturnValue('token');

      await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should validate active account only', async () => {
      const inactiveUser = {
        ...mockUser,
        isActive: false,
      };

      prisma.user.findFirst.mockResolvedValue(inactiveUser as any);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should validate active tenant', async () => {
      const userWithInactiveTenant = {
        ...mockUser,
        tenant: {
          ...mockUser.tenant,
          isActive: false,
        },
      };

      prisma.user.findFirst.mockResolvedValue(userWithInactiveTenant as any);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Tenant is inactive');
    });
  });

  describe('forgotPassword', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      isActive: true,
    };

    it('should create password reset token (NEW - database backed)', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser as any);
      prisma.passwordResetToken.count.mockResolvedValue(0);
      prisma.passwordResetToken.create.mockResolvedValue({ id: 1 } as any);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-token');

      const result = await service.forgotPassword({
        email: 'test@example.com',
      });

      expect(result.message).toContain('password reset link has been sent');
      expect(prisma.passwordResetToken.create).toHaveBeenCalled();
    });

    it('should rate limit requests (max 3/hour) (NEW)', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser as any);
      prisma.passwordResetToken.count.mockResolvedValue(3); // Already 3 tokens

      const result = await service.forgotPassword({
        email: 'test@example.com',
      });

      expect(result.message).toContain('password reset link has been sent');
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it('should return success even for non-existent email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'nonexistent@example.com',
      });

      expect(result.message).toContain('password reset link has been sent');
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it('should prevent timing attacks (NEW)', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const startTime = Date.now();
      await service.forgotPassword({ email: 'nonexistent@example.com' });
      const duration = Date.now() - startTime;

      // Should take at least 100ms (minimum time)
      expect(duration).toBeGreaterThanOrEqual(100);
    });

    it('should hash token before storing in database', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser as any);
      prisma.passwordResetToken.count.mockResolvedValue(0);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-token');
      prisma.passwordResetToken.create.mockResolvedValue({ id: 1 } as any);

      await service.forgotPassword({ email: 'test@example.com' });

      expect(argon2.hash).toHaveBeenCalled();
      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            token: 'hashed-token',
          }),
        }),
      );
    });
  });

  describe('resetPassword', () => {
    const mockToken = {
      id: 1,
      userId: 1,
      token: 'hashed-token',
      used: false,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      user: {
        id: 1,
        email: 'test@example.com',
        isActive: true,
      },
    };

    it('should reset password with valid token', async () => {
      prisma.passwordResetToken.findMany.mockResolvedValue([mockToken as any]);
      (argon2.verify as jest.Mock).mockImplementation(async (token, hash) => {
        return hash === 'hashed-token';
      });
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      prisma.passwordResetToken.update.mockResolvedValue(mockToken as any);
      prisma.user.update.mockResolvedValue({ id: 1 } as any);

      const result = await service.resetPassword({
        token: 'plain-token',
        newPassword: 'newPassword123!',
      });

      expect(result.message).toContain('successful');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { passwordHash: 'new-hashed-password' },
      });
    });

    it('should mark token as used (NEW)', async () => {
      prisma.passwordResetToken.findMany.mockResolvedValue([mockToken as any]);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      prisma.passwordResetToken.update.mockResolvedValue(mockToken as any);
      prisma.user.update.mockResolvedValue({ id: 1 } as any);

      await service.resetPassword({
        token: 'plain-token',
        newPassword: 'newPassword123!',
      });

      expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { used: true },
      });
    });

    it('should throw error with expired token (NEW)', async () => {
      const expiredToken = {
        ...mockToken,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };

      prisma.passwordResetToken.findMany.mockResolvedValue([expiredToken as any]);

      await expect(
        service.resetPassword({
          token: 'expired-token',
          newPassword: 'newPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error with used token (NEW)', async () => {
      const usedToken = {
        ...mockToken,
        used: true,
      };

      prisma.passwordResetToken.findMany.mockResolvedValue([usedToken as any]);

      await expect(
        service.resetPassword({
          token: 'used-token',
          newPassword: 'newPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error with invalid token', async () => {
      prisma.passwordResetToken.findMany.mockResolvedValue([mockToken as any]);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.resetPassword({
          token: 'invalid-token',
          newPassword: 'newPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        service.resetPassword({
          token: 'invalid-token',
          newPassword: 'newPassword123!',
        }),
      ).rejects.toThrow('Invalid or expired reset token');
    });

    it('should validate new password strength (implicit via DTO)', async () => {
      prisma.passwordResetToken.findMany.mockResolvedValue([mockToken as any]);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      prisma.passwordResetToken.update.mockResolvedValue(mockToken as any);
      prisma.user.update.mockResolvedValue({ id: 1 } as any);

      const result = await service.resetPassword({
        token: 'valid-token',
        newPassword: 'StrongP@ssw0rd!',
      });

      expect(result.message).toContain('successful');
    });
  });

  describe('refreshToken', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
      tenantId: 1,
      isActive: true,
      tenant: {
        id: 1,
        name: 'Test Tenant',
        code: 'TEST',
        isActive: true,
      },
    };

    it('should generate new tokens with valid refresh token', async () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        tenantId: 1,
      };

      mockJwtService.verify.mockReturnValue(payload);
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('should throw error with invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error when user is inactive', async () => {
      const payload = { sub: 1 };
      mockJwtService.verify.mockReturnValue(payload);

      const inactiveUser = {
        ...mockUser,
        isActive: false,
      };

      prisma.user.findUnique.mockResolvedValue(inactiveUser as any);

      await expect(
        service.refreshToken('valid-refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'ADMIN',
      tenantId: 1,
      isActive: true,
      tenant: {
        id: 1,
        code: 'TEST',
        isActive: true,
      },
    };

    it('should return user data for valid payload', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.validateUser({
        sub: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        tenantId: 1,
      });

      expect(result).toBeDefined();
      expect(result!.userId).toBe(1);
      expect(result!.email).toBe('test@example.com');
      expect(result!.tenantCode).toBe('TEST');
    });

    it('should return null for inactive user', async () => {
      const inactiveUser = {
        ...mockUser,
        isActive: false,
      };

      prisma.user.findUnique.mockResolvedValue(inactiveUser as any);

      const result = await service.validateUser({
        sub: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        tenantId: 1,
      });

      expect(result).toBeNull();
    });

    it('should return null for inactive tenant', async () => {
      const userWithInactiveTenant = {
        ...mockUser,
        tenant: {
          ...mockUser.tenant,
          isActive: false,
        },
      };

      prisma.user.findUnique.mockResolvedValue(userWithInactiveTenant as any);

      const result = await service.validateUser({
        sub: 1,
        email: 'test@example.com',
        role: 'ADMIN',
        tenantId: 1,
      });

      expect(result).toBeNull();
    });
  });

  describe('getMe', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
      tenantId: 1,
      isActive: true,
      tenant: {
        id: 1,
        name: 'Test Tenant',
        code: 'TEST',
      },
    };

    it('should return current user profile', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.getMe(1);

      expect(result.email).toBe('test@example.com');
      expect(result.tenant).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should update user profile successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        phone: '+905551234567',
      };

      prisma.user.update.mockResolvedValue(updatedUser as any);

      const result = await service.updateMe(1, {
        name: 'Updated Name',
        phone: '+905551234567',
      });

      expect(result.name).toBe('Updated Name');
      expect(result.phone).toBe('+905551234567');
    });

    it('should throw error when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMe(999, { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('hashPassword', () => {
    it('should hash password using argon2', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.hashPassword('password123');

      expect(result).toBe('hashed-password');
      expect(argon2.hash).toHaveBeenCalledWith('password123');
    });
  });

  describe('verifyPassword', () => {
    it('should verify password correctly', async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword('hash', 'password');

      expect(result).toBe(true);
      expect(argon2.verify).toHaveBeenCalledWith('hash', 'password');
    });

    it('should return false for incorrect password', async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyPassword('hash', 'wrong-password');

      expect(result).toBe(false);
    });
  });
});

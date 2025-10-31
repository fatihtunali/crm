import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';

export interface JwtPayload {
  sub: number; // user ID
  email: string;
  role: string;
  tenantId: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    tenantId: number;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email (across all tenants)
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDto.email,
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if tenant is active
    if (!user.tenant.isActive) {
      throw new UnauthorizedException('Tenant is inactive');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Get fresh user data
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              code: true,
              isActive: true,
            },
          },
        },
      });

      if (!user || !user.isActive || !user.tenant.isActive) {
        throw new UnauthorizedException('User or tenant is inactive');
      }

      // Generate new tokens
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '24h',
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Hash password with Argon2
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  /**
   * Verify password
   */
  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  /**
   * Validate user (called by JWT strategy)
   */
  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
        },
      },
    });

    if (!user || !user.isActive || !user.tenant.isActive) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantCode: user.tenant.code,
    };
  }

  /**
   * Get current user profile
   */
  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        preferredLanguage: true,
        tenantId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
            defaultCurrency: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update current user profile
   */
  async updateMe(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateProfileDto.name,
        phone: updateProfileDto.phone,
        preferredLanguage: updateProfileDto.preferredLanguage,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        preferredLanguage: true,
        tenantId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            code: true,
            defaultCurrency: true,
          },
        },
      },
    });

    return updatedUser;
  }

  /**
   * Request password reset
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: forgotPasswordDto.email,
        isActive: true,
      },
    });

    // Always return success to prevent email enumeration
    const successResponse = {
      message: 'If the email exists, a password reset link has been sent (stub implementation)',
    };

    if (!user) {
      return successResponse;
    }

    // Generate password reset token (valid for 1 hour)
    const resetPayload = {
      sub: user.id,
      email: user.email,
      type: 'password-reset',
    };

    const resetToken = this.jwtService.sign(resetPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h',
    });

    // TODO: Send email with reset link
    // For now, just log it
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    console.log(`[PASSWORD RESET STUB] Reset token for ${user.email}: ${resetToken}`);
    console.log(`[PASSWORD RESET STUB] Reset link: /auth/reset-password?token=${resetToken}`);

    return successResponse;
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // Verify reset token
      const payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Check if token is a password reset token
      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(resetPasswordDto.newPassword);

      // Update password
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
        },
      });

      return {
        message: 'Password reset successful. You can now login with your new password.',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  /**
   * Logout (optional - invalidate tokens)
   * Note: Since we're using stateless JWT, true logout requires a token blacklist
   * For now, this is a stub that the client can call before removing tokens
   */
  async logout(userId: number) {
    // Update last logout timestamp (we can add this field later if needed)
    // For now, just return success
    // TODO: Implement token blacklist if needed

    return {
      message: 'Logged out successfully. Please remove tokens from client storage.',
    };
  }
}

import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { Public } from '../common/decorators/public.decorator';
import { UserId } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password (Rate limit: 5 attempts/min)' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'admin@tourcrm.com',
          name: 'Super Admin',
          role: 'OWNER',
          tenantId: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 1,
        email: 'admin@tourcrm.com',
        name: 'Admin User',
        role: 'OWNER',
        phone: '+1234567890',
        preferredLanguage: 'en',
        tenantId: 1,
        isActive: true,
        lastLoginAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        tenant: {
          id: 1,
          name: 'Tour Company',
          code: 'TOUR01',
          defaultCurrency: 'EUR',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@UserId() userId: number) {
    return this.authService.getMe(userId);
  }

  @Patch('me')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMe(
    @UserId() userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateMe(userId, updateProfileDto);
  }

  @Public()
  @Throttle({ auth: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset (Rate limit: 3 attempts/min)',
    description: 'Send password reset email (stub implementation). Always returns success to prevent email enumeration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email exists)',
    schema: {
      example: {
        message: 'If the email exists, a password reset link has been sent (stub implementation)',
      },
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token (Rate limit: 5 attempts/min)',
    description: 'Reset user password using the token received via email',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      example: {
        message: 'Password reset successful. You can now login with your new password.',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('logout')
  @ApiBearerAuth('bearerAuth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout (optional)',
    description: 'Optional logout endpoint. Since JWTs are stateless, client should remove tokens from storage.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: {
      example: {
        message: 'Logged out successfully. Please remove tokens from client storage.',
      },
    },
  })
  async logout(@UserId() userId: number) {
    return this.authService.logout(userId);
  }
}

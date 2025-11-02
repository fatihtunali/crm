import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsBoolean, IsOptional, MinLength, Matches } from 'class-validator';
import { UserRole } from '@tour-crm/shared';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john@tourcrm.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password123!',
    minLength: 8,
    description: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  })
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.AGENT })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ example: '+90 532 123 4567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

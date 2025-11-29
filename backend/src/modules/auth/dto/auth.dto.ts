import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../modules/users/user.entity';

export class LoginDto {
  @ApiProperty({ example: 'admin@guarderia.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@guarderia.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'parent', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class SocialLoginDto {
  @ApiProperty({ example: 'admin@guarderia.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'google' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'google_user_id_123' })
  @IsString()
  providerId: string;

  @ApiProperty({ example: 'access_token_here', required: false })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiProperty({ example: 'id_token_here', required: false })
  @IsOptional()
  @IsString()
  credential?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'current_password' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'new_password_123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'Juan', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Pérez', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+34 123 456 789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@guarderia.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset_token_here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'new_password_123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
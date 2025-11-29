import { IsNotEmpty, IsOptional, IsEmail, IsString, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  certifications?: string;
}

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  certifications?: string;

  @IsOptional()
  isActive?: boolean;
}

export class TeacherResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  certifications?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Groups info
  groups?: {
    id: string;
    name: string;
    color: string;
    studentCount?: number;
  }[];
}

import { IsNotEmpty, IsOptional, IsEmail, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { Gender } from '../student.entity';

export class CreateStudentDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  allergies?: string;

  @IsOptional()
  observations?: string;

  @IsOptional()
  emergencyContact?: string;

  @IsOptional()
  emergencyPhone?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  // Para admins que pueden crear estudiante con info del padre
  @IsOptional()
  parentFirstName?: string;

  @IsOptional()
  parentLastName?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  parentPhone?: string;
}

export class UpdateStudentDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  allergies?: string;

  @IsOptional()
  observations?: string;

  @IsOptional()
  emergencyContact?: string;

  @IsOptional()
  emergencyPhone?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  // Para actualizar info del padre
  @IsOptional()
  parentFirstName?: string;

  @IsOptional()
  parentLastName?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  parentPhone?: string;
}

export class StudentResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: Gender;
  allergies?: string;
  observations?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: Date;
  updatedAt: Date;

  // Parent info - only for admin and teacher
  parent?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string; // Only for admin
    phone?: string; // Only for admin
  };

  // Groups info
  groups?: {
    id: string;
    name: string;
    color: string;
  }[];
}
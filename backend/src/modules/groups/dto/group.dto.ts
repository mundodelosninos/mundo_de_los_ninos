import { IsNotEmpty, IsOptional, IsInt, IsUUID, IsArray, Min, Max } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxStudents?: number;

  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  studentIds?: string[];
}

export class UpdateGroupDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxStudents?: number;

  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  studentIds?: string[];
}

export class AddStudentsToGroupDto {
  @IsArray()
  @IsUUID('all', { each: true })
  studentIds: string[];
}

export class GroupResponseDto {
  id: string;
  name: string;
  description?: string;
  color?: string;
  maxStudents?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Teacher info - only for admin
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string; // Only for admin
  };

  // Students info - filtered based on role
  students?: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: string;
    parent?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string; // Only for admin
      phone?: string; // Only for admin
    };
  }[];

  studentCount: number;
}
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsString,
  IsDateString,
} from 'class-validator';
import { MediaType } from '../student-media.entity';

export class CreateMediaDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  originalFileName: string;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @IsNotEmpty()
  @IsString()
  fileKey: string;

  @IsEnum(MediaType)
  mediaType: MediaType;

  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @IsNotEmpty()
  fileSize: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  studentIds: string[];
}

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];
}

export class QueryMediaDto {
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsUUID()
  uploadedById?: string;
}

export class MediaResponseDto {
  id: string;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileKey: string;
  mediaType: MediaType;
  mimeType: string;
  fileSize: number;
  description?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role: string;
  };

  students?: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
}

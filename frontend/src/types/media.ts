import { User, Student } from './user';

export enum MediaType {
  PHOTO = 'photo',
  DOCUMENT = 'document',
}

export interface StudentMedia {
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

export interface CreateMediaDto {
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileKey: string;
  mediaType: MediaType;
  mimeType: string;
  fileSize: number;
  description?: string;
  studentIds: string[];
}

export interface UpdateMediaDto {
  description?: string;
  studentIds?: string[];
}

export interface QueryMediaParams {
  studentId?: string;
  mediaType?: MediaType;
  fromDate?: string;
  toDate?: string;
  uploadedById?: string;
}

export interface MediaUploadFormData {
  file: File;
  mediaType: MediaType;
  description?: string;
  studentIds: string[];
}

// Helper type for media with full student and uploader details
export interface StudentMediaDetailed extends StudentMedia {
  uploadedBy: User;
  students: Student[];
}

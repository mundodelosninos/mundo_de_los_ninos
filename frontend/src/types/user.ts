export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  PARENT = 'parent',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  authProvider: AuthProvider;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  children?: Student[];
  groups?: Group[];
  
  // Getters
  fullName: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  allergies?: string;
  observations?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  photo?: string;
  isActive: boolean;
  parent: User;
  parentId: string;
  groups?: Group[];
  createdAt: Date;
  updatedAt: Date;
  
  // Getters
  fullName: string;
  age: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  color?: string;
  teacher: User;
  teacherId: string;
  students?: Student[];
  maxStudents?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
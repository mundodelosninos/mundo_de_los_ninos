import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';

export enum MediaType {
  PHOTO = 'photo',
  DOCUMENT = 'document',
}

@Entity('student_media')
export class StudentMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  originalFileName: string;

  @Column()
  fileUrl: string;

  @Column()
  fileKey: string;

  @Column({ type: 'enum', enum: MediaType })
  mediaType: MediaType;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column({ name: 'uploadedById', nullable: true })
  uploadedById: string;

  @ManyToMany(() => Student, (student) => student.media, { eager: true })
  @JoinTable({
    name: 'student_media_students',
    joinColumn: { name: 'studentMediaId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
  })
  students: Student[];

  // Computed property to check if user can access this media
  canUserAccess(userId: string, userRole: string, userChildren: string[]): boolean {
    // Admin can access all
    if (userRole === 'admin') return true;

    // Teacher can access if they uploaded it
    if (userRole === 'teacher' && this.uploadedById === userId) return true;

    // Parent can access if any of their children are tagged
    if (userRole === 'parent') {
      return this.students.some((student) => userChildren.includes(student.id));
    }

    return false;
  }
}

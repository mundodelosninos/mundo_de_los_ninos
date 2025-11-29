import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Student } from '../students/student.entity';
import { Group } from '../groups/group.entity';
import { Message } from '../chat/message.entity';
import { CalendarEvent } from '../calendar/calendar-event.entity';
import { Activity } from '../attendance/activity.entity';

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

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider: AuthProvider;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  facebookId: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  mustChangePassword: boolean;

  @Column({ type: 'json', nullable: true })
  preferences: any;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Student, (student) => student.parent, { cascade: true })
  children: Student[];

  @OneToMany(() => Group, (group) => group.teacher)
  groups: Group[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => CalendarEvent, (event) => event.createdBy)
  createdEvents: CalendarEvent[];

  @OneToMany(() => Activity, (activity) => activity.assignedBy)
  activities: Activity[];

  @OneToMany('StudentMedia', (media: any) => media.uploadedBy)
  uploadedMedia: any[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.authProvider === AuthProvider.LOCAL) {
      // Only hash if password has been modified (not already hashed)
      const isHashed = this.password.startsWith('$2a$') || this.password.startsWith('$2b$');
      if (!isHashed) {
        this.password = await bcrypt.hash(this.password, 10);
      }
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}   
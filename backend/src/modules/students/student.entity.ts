import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Activity } from '../attendance/activity.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.children)
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @Column({ name: 'parentId' })
  parentId: string;

  @ManyToMany(() => Group, (group) => group.students)
  groups: Group[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => Activity, (activity) => activity.student)
  activities: Activity[];

  @ManyToMany('StudentMedia', (media: any) => media.students)
  media: any[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
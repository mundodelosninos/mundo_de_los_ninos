import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EARLY_DEPARTURE = 'early_departure',
}

// Snack Status (formerly Food)
export enum SnackStatus {
  ATE_ALL = 'ate_all',
  ATE_SOME = 'ate_some',
  DID_NOT_EAT = 'did_not_eat',
}

// Lunch Status (formerly Sleep)
export enum LunchStatus {
  ATE_ALL = 'ate_all',
  ATE_SOME = 'ate_some',
  DID_NOT_EAT = 'did_not_eat',
}

// Urination Status (formerly Activity)
export enum UrinationStatus {
  YES = 'yes',
  NO = 'no',
}

// Defecation Status (new)
export enum DefecationStatus {
  YES = 'yes',
  NO = 'no',
}

export enum MoodStatus {
  HAPPY = 'happy',
  SOMEWHAT_HAPPY = 'somewhat_happy',
  ACTIVE = 'active',
  TIRED = 'tired',
  HEALTHY = 'healthy',
  UNWELL = 'unwell',
}

// Legacy exports for backwards compatibility
export const FoodStatus = SnackStatus;
export const SleepStatus = LunchStatus;
export const ActivityStatus = UrinationStatus;

@Entity('attendances')
@Index(['studentId', 'date'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status: AttendanceStatus;

  @Column({ type: 'time', nullable: true })
  checkInTime: string;

  @Column({ type: 'time', nullable: true })
  checkOutTime: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Snack (formerly ate/food)
  @Column({ type: 'enum', enum: SnackStatus, nullable: true })
  ate: SnackStatus;

  // Lunch (formerly slept/sleep)
  @Column({ type: 'enum', enum: LunchStatus, nullable: true })
  slept: LunchStatus;

  // Urination (formerly participatedInActivities/activity)
  @Column({ type: 'enum', enum: UrinationStatus, nullable: true })
  participatedInActivities: UrinationStatus;

  // Defecation (new field)
  @Column({ type: 'enum', enum: DefecationStatus, nullable: true })
  defecation: DefecationStatus;

  @Column({ type: 'enum', enum: MoodStatus, nullable: true })
  mood: MoodStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Student, (student) => student.attendances)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId' })
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'markedById' })
  markedBy: User;

  @Column({ name: 'markedById' })
  markedById: string;
}
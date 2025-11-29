import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Student } from '../students/student.entity';
import { User } from '../users/user.entity';

export enum ActivityType {
  MEAL = 'meal',
  NAP = 'nap',
  PLAY = 'play',
  LEARNING = 'learning',
  OUTDOOR = 'outdoor',
  ART = 'art',
  MUSIC = 'music',
  OTHER = 'other',
}

export enum ActivityStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.OTHER,
  })
  type: ActivityType;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.SCHEDULED,
  })
  status: ActivityStatus;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  batchId: string;

  @ManyToOne(() => Student, (student) => student.activities)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId' })
  studentId: string;

  @ManyToOne(() => User, (user) => user.activities)
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User;

  @Column({ name: 'assignedById' })
  assignedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
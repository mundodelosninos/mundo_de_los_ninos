import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum EventType {
  CLASS = 'class',
  MEAL = 'meal',
  NAP = 'nap',
  ACTIVITY = 'activity',
  MEETING = 'meeting',
  EVENT = 'event',
  HOLIDAY = 'holiday',
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: false })
  allDay: boolean;

  @Column({ type: 'enum', enum: EventType })
  type: EventType;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.SCHEDULED })
  status: EventStatus;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  googleEventId: string;

  @Column({ nullable: true })
  outlookEventId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.createdEvents)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ name: 'createdById' })
  createdById: string;

  @OneToMany(() => EventParticipant, (participant) => participant.event)
  participants: EventParticipant[];
}

@Entity('event_participants')
export class EventParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  participantId: string;

  @Column({ type: 'enum', enum: ['user', 'student', 'group'] })
  participantType: string;

  @Column({ type: 'enum', enum: ['invited', 'accepted', 'declined'], default: 'invited' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date;

  @ManyToOne(() => CalendarEvent, (event) => event.participants)
  @JoinColumn({ name: 'eventId' })
  event: CalendarEvent;

  @Column({ name: 'eventId' })
  eventId: string;
}
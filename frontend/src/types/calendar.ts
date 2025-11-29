import { User } from './user';

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

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: EventType;
  status: EventStatus;
  location?: string;
  participants?: EventParticipant[];
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  participantId: string;
  participantType: 'user' | 'student' | 'group';
  status: 'invited' | 'accepted' | 'declined';
}

export interface CalendarIntegration {
  id: string;
  userId: string;
  provider: 'google' | 'outlook';
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  isActive: boolean;
}
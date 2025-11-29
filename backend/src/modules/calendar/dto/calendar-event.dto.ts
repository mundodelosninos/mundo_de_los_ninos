import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsUUID, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType, EventStatus } from '../calendar-event.entity';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(EventType)
  type: EventType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  groupIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  attendeeIds?: string[];
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  groupIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  attendeeIds?: string[];
}

export class EventResponseDto {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  createdAt: Date;
  updatedAt: Date;

  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };

  participants: {
    id: string;
    participantId: string;
    participantType: string;
    status: string;
    participant?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
}

export class EventParticipantDto {
  @IsUUID()
  participantId: string;

  @IsEnum(['user', 'student', 'group'])
  participantType: string;
}

export class BulkEventParticipantsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventParticipantDto)
  participants: EventParticipantDto[];
}
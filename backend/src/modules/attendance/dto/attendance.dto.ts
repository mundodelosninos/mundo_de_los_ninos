import { IsNotEmpty, IsEnum, IsOptional, IsDateString, IsUUID, Matches } from 'class-validator';
import { AttendanceStatus, SnackStatus, LunchStatus, UrinationStatus, DefecationStatus, MoodStatus } from '../attendance.entity';
import { ActivityType, ActivityStatus } from '../activity.entity';

export class CreateAttendanceDto {
  @IsUUID()
  studentId: string;

  @IsDateString()
  date: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'checkInTime must be in HH:MM format' })
  checkInTime?: string;

  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'checkOutTime must be in HH:MM format' })
  checkOutTime?: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsEnum(SnackStatus)
  ate?: SnackStatus;

  @IsOptional()
  @IsEnum(LunchStatus)
  slept?: LunchStatus;

  @IsOptional()
  @IsEnum(UrinationStatus)
  participatedInActivities?: UrinationStatus;

  @IsOptional()
  @IsEnum(DefecationStatus)
  defecation?: DefecationStatus;

  @IsOptional()
  @IsEnum(MoodStatus)
  mood?: MoodStatus;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'checkInTime must be in HH:MM format' })
  checkInTime?: string;

  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'checkOutTime must be in HH:MM format' })
  checkOutTime?: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsEnum(SnackStatus)
  ate?: SnackStatus;

  @IsOptional()
  @IsEnum(LunchStatus)
  slept?: LunchStatus;

  @IsOptional()
  @IsEnum(UrinationStatus)
  participatedInActivities?: UrinationStatus;

  @IsOptional()
  @IsEnum(DefecationStatus)
  defecation?: DefecationStatus;

  @IsOptional()
  @IsEnum(MoodStatus)
  mood?: MoodStatus;
}

export class CreateActivityDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsEnum(ActivityType)
  type: ActivityType;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  notes?: string;

  @IsUUID()
  studentId: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;
}

export class UpdateActivityDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  notes?: string;
}

export class AttendanceResponseDto {
  id: string;
  date: Date;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  ate?: SnackStatus;
  slept?: LunchStatus;
  participatedInActivities?: UrinationStatus;
  defecation?: DefecationStatus;
  mood?: MoodStatus;
  createdAt: Date;
  updatedAt: Date;

  student: {
    id: string;
    firstName: string;
    lastName: string;
    parent?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
    };
  };

  markedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export class ActivityResponseDto {
  id: string;
  title: string;
  description?: string;
  type: ActivityType;
  status: ActivityStatus;
  startTime: Date;
  endTime: Date;
  notes?: string;
  batchId?: string;
  createdAt: Date;
  updatedAt: Date;

  student: {
    id: string;
    firstName: string;
    lastName: string;
    parent?: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
    };
  };

  assignedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export class BulkAttendanceDto {
  @IsDateString()
  date: string;

  @IsNotEmpty()
  attendances: {
    studentId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
    ate?: SnackStatus;
    slept?: LunchStatus;
    participatedInActivities?: UrinationStatus;
    defecation?: DefecationStatus;
    mood?: MoodStatus;
  }[];
}
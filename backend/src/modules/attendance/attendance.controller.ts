import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  CreateActivityDto,
  UpdateActivityDto,
  BulkAttendanceDto,
} from './dto/attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAttendance(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.attendanceService.createAttendance(createAttendanceDto, currentUser);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async createBulkAttendance(
    @Body() bulkAttendanceDto: BulkAttendanceDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.attendanceService.createBulkAttendance(bulkAttendanceDto, currentUser);
  }

  @Get()
  async findAllAttendance(
    @CurrentUser() currentUser: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('studentId') studentId?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.attendanceService.findAllAttendance(currentUser, startDate, endDate, studentId, groupId);
  }

  @Patch(':id')
  async updateAttendance(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.attendanceService.updateAttendance(id, updateAttendanceDto, currentUser);
  }

  // Activity endpoints
  @Post('activities')
  @HttpCode(HttpStatus.CREATED)
  async createActivity(
    @Body() createActivityDto: CreateActivityDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.attendanceService.createActivity(createActivityDto, currentUser);
  }

  @Get('activities')
  async findAllActivities(
    @CurrentUser() currentUser: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('studentId') studentId?: string,
    @Query('type') type?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.attendanceService.findAllActivities(currentUser, startDate, endDate, studentId, type, groupId);
  }

  @Patch('activities/:id')
  async updateActivity(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.attendanceService.updateActivity(id, updateActivityDto, currentUser);
  }

  @Patch('activities/batch/:batchId')
  async updateActivitiesBatch(
    @Param('batchId') batchId: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.attendanceService.updateActivitiesBatch(batchId, updateActivityDto, currentUser);
  }

  @Delete('activities/:id')
  async deleteActivity(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.attendanceService.deleteActivity(id, currentUser);
  }

  @Delete('activities/batch/:batchId')
  async deleteActivitiesBatch(
    @Param('batchId') batchId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.attendanceService.deleteActivitiesBatch(batchId, currentUser);
  }
}
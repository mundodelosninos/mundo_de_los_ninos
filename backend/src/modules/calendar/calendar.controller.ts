import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CalendarService } from './calendar.service';
import {
  CreateEventDto,
  UpdateEventDto,
  EventParticipantDto
} from './dto/calendar-event.dto';

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  @Roles('admin', 'teacher')
  createEvent(@Body() createEventDto: CreateEventDto, @Request() req: any) {
    return this.calendarService.createEvent(createEventDto, req.user);
  }

  @Get('events')
  @Roles('admin', 'teacher', 'parent')
  findAllEvents(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.calendarService.findEventsForUser(req.user, startDate, endDate);
  }

  @Get('events/:id')
  @Roles('admin', 'teacher', 'parent')
  findEventById(@Param('id') id: string) {
    return this.calendarService.findEventById(id);
  }

  @Patch('events/:id')
  @Roles('admin', 'teacher')
  updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: any,
  ) {
    return this.calendarService.updateEvent(id, updateEventDto, req.user);
  }

  @Delete('events/:id')
  @Roles('admin', 'teacher')
  deleteEvent(@Param('id') id: string, @Request() req: any) {
    return this.calendarService.deleteEvent(id, req.user);
  }

  @Post('events/:id/participants')
  @Roles('admin', 'teacher')
  addParticipant(
    @Param('id') eventId: string,
    @Body() participantDto: EventParticipantDto,
    @Request() req: any,
  ) {
    return this.calendarService.addParticipantToEvent(
      eventId,
      participantDto,
      req.user,
    );
  }

  @Delete('events/:eventId/participants/:participantId/:participantType')
  @Roles('admin', 'teacher')
  removeParticipant(
    @Param('eventId') eventId: string,
    @Param('participantId') participantId: string,
    @Param('participantType') participantType: string,
    @Request() req: any,
  ) {
    return this.calendarService.removeParticipantFromEvent(
      eventId,
      participantId,
      participantType,
      req.user,
    );
  }

  @Patch('events/:eventId/participants/:participantId/status')
  @Roles('admin', 'teacher', 'parent')
  updateParticipantStatus(
    @Param('eventId') eventId: string,
    @Param('participantId') participantId: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.calendarService.updateParticipantStatus(
      eventId,
      participantId,
      status,
      req.user,
    );
  }

  @Get('upcoming')
  @Roles('admin', 'teacher', 'parent')
  getUpcomingEvents(@Request() req: any, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.calendarService.getUpcomingEvents(req.user, limitNumber);
  }

  @Post('events/:id/sync/google')
  @Roles('admin', 'teacher')
  syncToGoogle(
    @Param('id') eventId: string,
    @Body('accessToken') accessToken: string,
    @Request() req: any,
  ) {
    return this.calendarService.syncEventToGoogle(eventId, accessToken, req.user);
  }

  @Post('events/:id/sync/outlook')
  @Roles('admin', 'teacher')
  syncToOutlook(
    @Param('id') eventId: string,
    @Body('accessToken') accessToken: string,
    @Request() req: any,
  ) {
    return this.calendarService.syncEventToOutlook(eventId, accessToken, req.user);
  }

  @Get('auth/google/url')
  @Roles('admin', 'teacher')
  getGoogleAuthUrl() {
    return { url: this.calendarService.getGoogleAuthUrl() };
  }

  @Get('auth/outlook/url')
  @Roles('admin', 'teacher')
  getOutlookAuthUrl() {
    return { url: this.calendarService.getOutlookAuthUrl() };
  }

  @Post('auth/google/callback')
  @Roles('admin', 'teacher')
  handleGoogleCallback(@Body('code') code: string) {
    return this.calendarService.handleGoogleCallback(code);
  }

  @Post('auth/outlook/callback')
  @Roles('admin', 'teacher')
  handleOutlookCallback(@Body('code') code: string) {
    return this.calendarService.handleOutlookCallback(code);
  }
}
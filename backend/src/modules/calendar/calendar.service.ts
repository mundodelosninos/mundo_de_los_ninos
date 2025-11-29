import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThanOrEqual } from 'typeorm';
import { CalendarEvent, EventParticipant, EventType, EventStatus } from './calendar-event.entity';
import { User, UserRole } from '../users/user.entity';
import { Student } from '../students/student.entity';
import { Group } from '../groups/group.entity';
import { CreateEventDto, UpdateEventDto, EventParticipantDto } from './dto/calendar-event.dto';
import { CalendarIntegrationService } from './calendar-integration.service';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private eventRepository: Repository<CalendarEvent>,
    @InjectRepository(EventParticipant)
    private participantRepository: Repository<EventParticipant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private calendarIntegrationService: CalendarIntegrationService,
  ) {}

  async createEvent(createEventDto: CreateEventDto, createdBy: User): Promise<CalendarEvent> {
    // Role-based validation
    if (createdBy.role === 'parent') {
      throw new ForbiddenException('Parents cannot create calendar events');
    }

    // Validate dates
    if (new Date(createEventDto.startDate) >= new Date(createEventDto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Create the event
    const event = this.eventRepository.create({
      ...createEventDto,
      createdBy,
      createdById: createdBy.id,
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
    });

    const savedEvent = await this.eventRepository.save(event);

    // Add participants based on role permissions
    await this.addParticipantsToEvent(savedEvent, createEventDto, createdBy);

    return this.findEventById(savedEvent.id);
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto, user: User): Promise<CalendarEvent> {
    const event = await this.findEventById(id);

    // Role-based permissions
    const canEdit = await this.canUserEditEvent(event, user);
    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to edit this event');
    }

    // Validate dates if provided
    if (updateEventDto.startDate && updateEventDto.endDate) {
      if (new Date(updateEventDto.startDate) >= new Date(updateEventDto.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Update event - exclude participant IDs from entity update
    const { studentIds, groupIds, attendeeIds, ...eventUpdateData } = updateEventDto;
    const updateData: any = { ...eventUpdateData };
    if (updateEventDto.startDate) updateData.startDate = new Date(updateEventDto.startDate);
    if (updateEventDto.endDate) updateData.endDate = new Date(updateEventDto.endDate);

    await this.eventRepository.update(id, updateData);

    // Update participants if provided
    if (updateEventDto.attendeeIds || updateEventDto.studentIds || updateEventDto.groupIds) {
      await this.updateEventParticipants(event, updateEventDto, user);
    }

    return this.findEventById(id);
  }

  async deleteEvent(id: string, user: User): Promise<void> {
    const event = await this.findEventById(id);

    // Role-based permissions
    const canDelete = await this.canUserDeleteEvent(event, user);
    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this event');
    }

    // Delete participants first
    await this.participantRepository.delete({ eventId: id });

    // Delete event
    await this.eventRepository.delete(id);
  }

  async findEventsForUser(user: User, startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    let events: CalendarEvent[];

    // Date filtering
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        startDate: Between(new Date(startDate), new Date(endDate))
      };
    }

    switch (user.role) {
      case 'admin':
        // Admins can see all events
        events = await this.eventRepository.find({
          where: dateFilter,
          relations: ['createdBy', 'participants'],
          order: { startDate: 'ASC' }
        });
        break;

      case 'teacher':
        // Teachers can see events they created or are participants in
        const teacherParticipants = await this.participantRepository.find({
          where: { participantId: user.id, participantType: 'user' },
          relations: ['event']
        });

        const teacherEventIds = teacherParticipants.map(p => p.eventId);

        events = await this.eventRepository.find({
          where: [
            { createdById: user.id, ...dateFilter },
            { id: In(teacherEventIds), ...dateFilter }
          ],
          relations: ['createdBy', 'participants'],
          order: { startDate: 'ASC' }
        });
        break;

      case 'parent':
        // Parents can see events related to their children
        const children = await this.studentRepository.find({
          where: { parentId: user.id },
          relations: ['groups']
        });

        if (children.length === 0) {
          return [];
        }

        const childIds = children.map(child => child.id);
        const groupIds = children.flatMap(child => child.groups?.map(g => g.id) || []);

        const parentParticipants = await this.participantRepository.find({
          where: [
            { participantId: In(childIds), participantType: 'student' },
            { participantId: In(groupIds), participantType: 'group' },
            { participantId: user.id, participantType: 'user' }
          ],
          relations: ['event']
        });

        const parentEventIds = [...new Set(parentParticipants.map(p => p.eventId))];

        if (parentEventIds.length === 0) {
          return [];
        }

        events = await this.eventRepository.find({
          where: { id: In(parentEventIds), ...dateFilter },
          relations: ['createdBy', 'participants'],
          order: { startDate: 'ASC' }
        });
        break;

      default:
        events = [];
    }

    // Populate participant details for each event
    for (const event of events) {
      await this.populateEventParticipants(event);
    }

    return events;
  }

  async findEventById(id: string): Promise<CalendarEvent> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['createdBy', 'participants']
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.populateEventParticipants(event);
    return event;
  }

  async addParticipantToEvent(eventId: string, participantDto: EventParticipantDto, user: User): Promise<void> {
    const event = await this.findEventById(eventId);

    // Check permissions
    const canManage = await this.canUserEditEvent(event, user);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to manage participants for this event');
    }

    // Check if participant already exists
    const existingParticipant = await this.participantRepository.findOne({
      where: {
        eventId,
        participantId: participantDto.participantId,
        participantType: participantDto.participantType
      }
    });

    if (existingParticipant) {
      throw new BadRequestException('Participant already added to this event');
    }

    // Add participant
    const participant = this.participantRepository.create({
      eventId,
      participantId: participantDto.participantId,
      participantType: participantDto.participantType,
      status: 'invited'
    });

    await this.participantRepository.save(participant);
  }

  async removeParticipantFromEvent(eventId: string, participantId: string, participantType: string, user: User): Promise<void> {
    const event = await this.findEventById(eventId);

    // Check permissions
    const canManage = await this.canUserEditEvent(event, user);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to manage participants for this event');
    }

    await this.participantRepository.delete({
      eventId,
      participantId,
      participantType
    });
  }

  async updateParticipantStatus(eventId: string, participantId: string, status: string, user: User): Promise<void> {
    // Users can update their own status, or admins/teachers can update any status
    const canUpdate = user.role === 'admin' ||
                     user.role === 'teacher' ||
                     user.id === participantId;

    if (!canUpdate) {
      throw new ForbiddenException('You do not have permission to update this participant status');
    }

    await this.participantRepository.update(
      { eventId, participantId, participantType: 'user' },
      { status, respondedAt: new Date() }
    );
  }

  // Helper methods
  private async canUserEditEvent(event: CalendarEvent, user: User): Promise<boolean> {
    if (user.role === 'admin') return true;
    if (user.role === 'teacher' && event.createdById === user.id) return true;
    return false;
  }

  private async canUserDeleteEvent(event: CalendarEvent, user: User): Promise<boolean> {
    if (user.role === 'admin') return true;
    if (user.role === 'teacher' && event.createdById === user.id) return true;
    return false;
  }

  private async addParticipantsToEvent(event: CalendarEvent, createEventDto: CreateEventDto, createdBy: User): Promise<void> {
    const participants: EventParticipant[] = [];

    // Add user attendees
    if (createEventDto.attendeeIds?.length > 0) {
      for (const attendeeId of createEventDto.attendeeIds) {
        participants.push(this.participantRepository.create({
          eventId: event.id,
          participantId: attendeeId,
          participantType: 'user',
          status: 'invited'
        }));
      }
    }

    // Add student participants
    if (createEventDto.studentIds?.length > 0) {
      for (const studentId of createEventDto.studentIds) {
        participants.push(this.participantRepository.create({
          eventId: event.id,
          participantId: studentId,
          participantType: 'student',
          status: 'invited'
        }));
      }
    }

    // Add group participants
    if (createEventDto.groupIds?.length > 0) {
      for (const groupId of createEventDto.groupIds) {
        participants.push(this.participantRepository.create({
          eventId: event.id,
          participantId: groupId,
          participantType: 'group',
          status: 'invited'
        }));
      }
    }

    if (participants.length > 0) {
      await this.participantRepository.save(participants);
    }
  }

  private async updateEventParticipants(event: CalendarEvent, updateEventDto: UpdateEventDto, user: User): Promise<void> {
    // Remove existing participants
    await this.participantRepository.delete({ eventId: event.id });

    // Add new participants
    await this.addParticipantsToEvent(event, updateEventDto as CreateEventDto, user);
  }

  private async populateEventParticipants(event: CalendarEvent): Promise<void> {
    for (const participant of event.participants) {
      switch (participant.participantType) {
        case 'user':
          const user = await this.userRepository.findOne({ where: { id: participant.participantId } });
          (participant as any).participant = user;
          break;
        case 'student':
          const student = await this.studentRepository.findOne({
            where: { id: participant.participantId },
            relations: ['parent']
          });
          (participant as any).participant = student;
          break;
        case 'group':
          const group = await this.groupRepository.findOne({ where: { id: participant.participantId } });
          (participant as any).participant = group;
          break;
      }
    }
  }

  // Calendar Integration Methods

  async syncEventToGoogle(eventId: string, accessToken: string, user: User): Promise<CalendarEvent> {
    const event = await this.findEventById(eventId);

    // Check permissions
    const canManage = await this.canUserEditEvent(event, user);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to sync this event');
    }

    const googleEventId = await this.calendarIntegrationService.syncToGoogleCalendar(event, accessToken);

    await this.eventRepository.update(eventId, { googleEventId });

    return this.findEventById(eventId);
  }

  async syncEventToOutlook(eventId: string, accessToken: string, user: User): Promise<CalendarEvent> {
    const event = await this.findEventById(eventId);

    // Check permissions
    const canManage = await this.canUserEditEvent(event, user);
    if (!canManage) {
      throw new ForbiddenException('You do not have permission to sync this event');
    }

    const outlookEventId = await this.calendarIntegrationService.syncToOutlookCalendar(event, accessToken);

    await this.eventRepository.update(eventId, { outlookEventId });

    return this.findEventById(eventId);
  }

  async getUpcomingEvents(user: User, limit: number = 10): Promise<CalendarEvent[]> {
    const now = new Date();
    let events: CalendarEvent[];

    switch (user.role) {
      case UserRole.ADMIN:
        events = await this.eventRepository.find({
          where: { startDate: MoreThanOrEqual(now) },
          relations: ['createdBy', 'participants'],
          order: { startDate: 'ASC' },
          take: limit
        });
        break;

      case UserRole.TEACHER:
        const teacherParticipants = await this.participantRepository.find({
          where: { participantId: user.id, participantType: 'user' },
          relations: ['event']
        });

        const teacherEventIds = teacherParticipants.map(p => p.eventId);

        events = await this.eventRepository.find({
          where: [
            { createdById: user.id, startDate: MoreThanOrEqual(now) },
            { id: In(teacherEventIds), startDate: MoreThanOrEqual(now) }
          ],
          relations: ['createdBy', 'participants'],
          order: { startDate: 'ASC' },
          take: limit
        });
        break;

      case UserRole.PARENT:
        const children = await this.studentRepository.find({
          where: { parentId: user.id },
          relations: ['groups']
        });

        if (children.length === 0) {
          return [];
        }

        const childIds = children.map(child => child.id);
        const groupIds = children.flatMap(child => child.groups?.map(g => g.id) || []);

        const parentParticipants = await this.participantRepository.find({
          where: [
            { participantId: In(childIds), participantType: 'student' },
            { participantId: In(groupIds), participantType: 'group' },
            { participantId: user.id, participantType: 'user' }
          ],
          relations: ['event']
        });

        const parentEventIds = [...new Set(parentParticipants.map(p => p.eventId))];

        if (parentEventIds.length === 0) {
          return [];
        }

        events = await this.eventRepository.find({
          where: { id: In(parentEventIds), startDate: MoreThanOrEqual(now) },
          relations: ['createdBy', 'participants'],
          order: { startDate: 'ASC' },
          take: limit
        });
        break;

      default:
        events = [];
    }

    // Populate participant details
    for (const event of events) {
      await this.populateEventParticipants(event);
    }

    return events;
  }

  getGoogleAuthUrl(): string {
    return this.calendarIntegrationService.getGoogleAuthUrl();
  }

  getOutlookAuthUrl(): string {
    return this.calendarIntegrationService.getOutlookAuthUrl();
  }

  async handleGoogleCallback(code: string): Promise<any> {
    return this.calendarIntegrationService.getGoogleTokens(code);
  }

  async handleOutlookCallback(code: string): Promise<any> {
    return this.calendarIntegrationService.getOutlookTokens(code);
  }
}
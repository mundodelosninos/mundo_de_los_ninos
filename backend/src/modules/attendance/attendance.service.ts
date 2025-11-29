import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

import { Attendance } from './attendance.entity';
import { Activity } from './activity.entity';
import { User, UserRole } from '../users/user.entity';
import { Student } from '../students/student.entity';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  CreateActivityDto,
  UpdateActivityDto,
  AttendanceResponseDto,
  ActivityResponseDto,
  BulkAttendanceDto,
} from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createAttendance(
    createAttendanceDto: CreateAttendanceDto,
    currentUser: User,
  ): Promise<AttendanceResponseDto> {
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden marcar asistencia');
    }

    const student = await this.studentRepository.findOne({
      where: { id: createAttendanceDto.studentId },
      relations: ['parent'],
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Teacher can only mark attendance for students in their groups
    if (currentUser.role === UserRole.TEACHER) {
      const hasAccess = await this.checkTeacherStudentAccess(currentUser.id, student.id);
      if (!hasAccess) {
        throw new ForbiddenException('Solo puedes marcar asistencia de estudiantes en tus grupos');
      }
    }

    // Check if attendance already exists for this date
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        studentId: createAttendanceDto.studentId,
        date: createAttendanceDto.date as any,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Ya existe un registro de asistencia para esta fecha');
    }

    const attendance = this.attendanceRepository.create({
      studentId: createAttendanceDto.studentId,
      date: createAttendanceDto.date as any,
      status: createAttendanceDto.status,
      checkInTime: createAttendanceDto.checkInTime,
      checkOutTime: createAttendanceDto.checkOutTime,
      notes: createAttendanceDto.notes,
      ate: createAttendanceDto.ate,
      slept: createAttendanceDto.slept,
      participatedInActivities: createAttendanceDto.participatedInActivities,
      mood: createAttendanceDto.mood,
      markedById: currentUser.id,
    });

    const savedAttendance = await this.attendanceRepository.save(attendance);

    return this.formatAttendanceResponse(
      await this.findAttendanceWithRelations(savedAttendance.id),
      currentUser.role,
    );
  }

  async findAllAttendance(
    currentUser: User,
    startDate?: string,
    endDate?: string,
    studentId?: string,
    groupId?: string,
  ): Promise<AttendanceResponseDto[]> {
    let whereCondition: any = {};

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereCondition.date = Between(start, end);
    }

    // Student filter (individual student takes precedence over group)
    if (studentId) {
      whereCondition.studentId = studentId;
    } else if (groupId) {
      // Group filter - get all students in the group
      const groupStudentIds = await this.getGroupStudentIds(groupId);
      if (groupStudentIds.length > 0) {
        whereCondition.studentId = In(groupStudentIds);
      } else {
        // No students in group, return empty array
        return [];
      }
    }

    let attendances: Attendance[];

    switch (currentUser.role) {
      case UserRole.ADMIN:
        attendances = await this.attendanceRepository.find({
          where: whereCondition,
          relations: ['student', 'student.parent', 'markedBy'],
          order: { date: 'DESC', createdAt: 'DESC' },
        });
        break;

      case UserRole.TEACHER:
        // Teacher sees only attendance for students in their groups
        const teacherStudentIds = await this.getTeacherStudentIds(currentUser.id);
        if (teacherStudentIds.length === 0) {
          attendances = [];
        } else {
          whereCondition.studentId = In(teacherStudentIds);
          attendances = await this.attendanceRepository.find({
            where: whereCondition,
            relations: ['student', 'student.parent', 'markedBy'],
            order: { date: 'DESC', createdAt: 'DESC' },
          });
        }
        break;

      case UserRole.PARENT:
        // Parent sees only their children's attendance
        const parentStudentIds = await this.getParentStudentIds(currentUser.id);
        if (parentStudentIds.length === 0) {
          attendances = [];
        } else {
          whereCondition.studentId = In(parentStudentIds);
          attendances = await this.attendanceRepository.find({
            where: whereCondition,
            relations: ['student', 'student.parent', 'markedBy'],
            order: { date: 'DESC', createdAt: 'DESC' },
          });
        }
        break;

      default:
        throw new ForbiddenException('No autorizado');
    }

    return attendances.map(attendance =>
      this.formatAttendanceResponse(attendance, currentUser.role),
    );
  }

  async updateAttendance(
    id: string,
    updateAttendanceDto: UpdateAttendanceDto,
    currentUser: User,
  ): Promise<AttendanceResponseDto> {
    const attendance = await this.findAttendanceWithRelations(id);

    if (!attendance) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }

    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden editar registros de asistencia');
    }

    // Teacher can only update attendance for students in their groups
    if (currentUser.role === UserRole.TEACHER) {
      const hasAccess = await this.checkTeacherStudentAccess(currentUser.id, attendance.studentId);
      if (!hasAccess) {
        throw new ForbiddenException('Solo puedes editar asistencia de estudiantes en tus grupos');
      }
    }

    // Update fields
    if (updateAttendanceDto.status !== undefined) attendance.status = updateAttendanceDto.status;
    if (updateAttendanceDto.checkInTime !== undefined) attendance.checkInTime = updateAttendanceDto.checkInTime;
    if (updateAttendanceDto.checkOutTime !== undefined) attendance.checkOutTime = updateAttendanceDto.checkOutTime;
    if (updateAttendanceDto.notes !== undefined) attendance.notes = updateAttendanceDto.notes;
    if (updateAttendanceDto.ate !== undefined) attendance.ate = updateAttendanceDto.ate;
    if (updateAttendanceDto.slept !== undefined) attendance.slept = updateAttendanceDto.slept;
    if (updateAttendanceDto.participatedInActivities !== undefined) attendance.participatedInActivities = updateAttendanceDto.participatedInActivities;
    if (updateAttendanceDto.mood !== undefined) attendance.mood = updateAttendanceDto.mood;

    const updatedAttendance = await this.attendanceRepository.save(attendance);

    return this.formatAttendanceResponse(
      await this.findAttendanceWithRelations(updatedAttendance.id),
      currentUser.role,
    );
  }

  async createBulkAttendance(
    bulkAttendanceDto: BulkAttendanceDto,
    currentUser: User,
  ): Promise<AttendanceResponseDto[]> {
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden marcar asistencia');
    }

    const results: AttendanceResponseDto[] = [];

    for (const attendanceData of bulkAttendanceDto.attendances) {
      try {
        const createDto: CreateAttendanceDto = {
          studentId: attendanceData.studentId,
          date: bulkAttendanceDto.date,
          status: attendanceData.status,
          checkInTime: attendanceData.checkInTime,
          checkOutTime: attendanceData.checkOutTime,
          notes: attendanceData.notes,
          ate: attendanceData.ate,
          slept: attendanceData.slept,
          participatedInActivities: attendanceData.participatedInActivities,
          mood: attendanceData.mood,
        };

        const result = await this.createAttendance(createDto, currentUser);
        results.push(result);
      } catch (error) {
        console.warn(`Failed to create attendance for student ${attendanceData.studentId}:`, (error as Error).message);
      }
    }

    return results;
  }

  // Activity management methods
  async createActivity(
    createActivityDto: CreateActivityDto,
    currentUser: User,
  ): Promise<ActivityResponseDto> {
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden crear actividades');
    }

    const student = await this.studentRepository.findOne({
      where: { id: createActivityDto.studentId },
      relations: ['parent'],
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Teacher can only create activities for students in their groups
    if (currentUser.role === UserRole.TEACHER) {
      const hasAccess = await this.checkTeacherStudentAccess(currentUser.id, student.id);
      if (!hasAccess) {
        throw new ForbiddenException('Solo puedes crear actividades para estudiantes en tus grupos');
      }
    }

    const activity = this.activityRepository.create({
      title: createActivityDto.title,
      description: createActivityDto.description,
      type: createActivityDto.type,
      startTime: new Date(createActivityDto.startTime),
      endTime: new Date(createActivityDto.endTime),
      notes: createActivityDto.notes,
      studentId: createActivityDto.studentId,
      assignedById: currentUser.id,
      batchId: createActivityDto.batchId,
    });

    const savedActivity = await this.activityRepository.save(activity);

    return this.formatActivityResponse(
      await this.findActivityWithRelations(savedActivity.id),
      currentUser.role,
    );
  }

  async findAllActivities(
    currentUser: User,
    startDate?: string,
    endDate?: string,
    studentId?: string,
    type?: string,
    groupId?: string,
  ): Promise<ActivityResponseDto[]> {
    let whereCondition: any = {};

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereCondition.startTime = Between(start, end);
    }

    // Student filter (individual student takes precedence over group)
    if (studentId) {
      whereCondition.studentId = studentId;
    } else if (groupId) {
      // Group filter - get all students in the group
      const groupStudentIds = await this.getGroupStudentIds(groupId);
      if (groupStudentIds.length > 0) {
        whereCondition.studentId = In(groupStudentIds);
      } else {
        // No students in group, return empty array
        return [];
      }
    }

    // Type filter
    if (type) {
      whereCondition.type = type;
    }

    let activities: Activity[];

    switch (currentUser.role) {
      case UserRole.ADMIN:
        activities = await this.activityRepository.find({
          where: whereCondition,
          relations: ['student', 'student.parent', 'assignedBy'],
          order: { startTime: 'DESC' },
        });
        break;

      case UserRole.TEACHER:
        const teacherStudentIds = await this.getTeacherStudentIds(currentUser.id);
        if (teacherStudentIds.length === 0) {
          activities = [];
        } else {
          whereCondition.studentId = In(teacherStudentIds);
          activities = await this.activityRepository.find({
            where: whereCondition,
            relations: ['student', 'student.parent', 'assignedBy'],
            order: { startTime: 'DESC' },
          });
        }
        break;

      case UserRole.PARENT:
        const parentStudentIds = await this.getParentStudentIds(currentUser.id);
        if (parentStudentIds.length === 0) {
          activities = [];
        } else {
          whereCondition.studentId = In(parentStudentIds);
          activities = await this.activityRepository.find({
            where: whereCondition,
            relations: ['student', 'student.parent', 'assignedBy'],
            order: { startTime: 'DESC' },
          });
        }
        break;

      default:
        throw new ForbiddenException('No autorizado');
    }

    return activities.map(activity =>
      this.formatActivityResponse(activity, currentUser.role),
    );
  }

  async updateActivity(
    id: string,
    updateActivityDto: UpdateActivityDto,
    currentUser: User,
  ): Promise<ActivityResponseDto> {
    const activity = await this.findActivityWithRelations(id);

    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }

    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden editar actividades');
    }

    // Teacher can only update activities for students in their groups
    if (currentUser.role === UserRole.TEACHER) {
      const hasAccess = await this.checkTeacherStudentAccess(currentUser.id, activity.studentId);
      if (!hasAccess) {
        throw new ForbiddenException('Solo puedes editar actividades de estudiantes en tus grupos');
      }
    }

    // Update fields
    if (updateActivityDto.title !== undefined) activity.title = updateActivityDto.title;
    if (updateActivityDto.description !== undefined) activity.description = updateActivityDto.description;
    if (updateActivityDto.type !== undefined) activity.type = updateActivityDto.type;
    if (updateActivityDto.status !== undefined) activity.status = updateActivityDto.status;
    if (updateActivityDto.startTime !== undefined) activity.startTime = new Date(updateActivityDto.startTime);
    if (updateActivityDto.endTime !== undefined) activity.endTime = new Date(updateActivityDto.endTime);
    if (updateActivityDto.notes !== undefined) activity.notes = updateActivityDto.notes;

    const updatedActivity = await this.activityRepository.save(activity);

    return this.formatActivityResponse(
      await this.findActivityWithRelations(updatedActivity.id),
      currentUser.role,
    );
  }

  async updateActivitiesBatch(
    batchId: string,
    updateActivityDto: UpdateActivityDto,
    currentUser: User,
  ): Promise<ActivityResponseDto[]> {
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden editar actividades');
    }

    // Find all activities with this batchId
    const activities = await this.activityRepository.find({
      where: { batchId },
      relations: ['student', 'student.parent', 'assignedBy'],
    });

    if (activities.length === 0) {
      throw new NotFoundException('No se encontraron actividades para este grupo');
    }

    // Check teacher access for all activities
    if (currentUser.role === UserRole.TEACHER) {
      const studentIds = activities.map(a => a.studentId);
      const teacherStudentIds = await this.getTeacherStudentIds(currentUser.id);
      const hasAccessToAll = studentIds.every(id => teacherStudentIds.includes(id));

      if (!hasAccessToAll) {
        throw new ForbiddenException('Solo puedes editar actividades de estudiantes en tus grupos');
      }
    }

    // Update all activities
    const updatedActivities = await Promise.all(
      activities.map(async (activity) => {
        if (updateActivityDto.title !== undefined) activity.title = updateActivityDto.title;
        if (updateActivityDto.description !== undefined) activity.description = updateActivityDto.description;
        if (updateActivityDto.type !== undefined) activity.type = updateActivityDto.type;
        if (updateActivityDto.status !== undefined) activity.status = updateActivityDto.status;
        if (updateActivityDto.startTime !== undefined) activity.startTime = new Date(updateActivityDto.startTime);
        if (updateActivityDto.endTime !== undefined) activity.endTime = new Date(updateActivityDto.endTime);
        if (updateActivityDto.notes !== undefined) activity.notes = updateActivityDto.notes;

        return this.activityRepository.save(activity);
      })
    );

    // Return formatted responses
    return Promise.all(
      updatedActivities.map(async (activity) =>
        this.formatActivityResponse(
          await this.findActivityWithRelations(activity.id),
          currentUser.role,
        )
      )
    );
  }

  async deleteActivity(
    id: string,
    currentUser: User,
  ): Promise<{ message: string }> {
    const activity = await this.findActivityWithRelations(id);

    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }

    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden eliminar actividades');
    }

    // Teacher can only delete activities for students in their groups
    if (currentUser.role === UserRole.TEACHER) {
      const hasAccess = await this.checkTeacherStudentAccess(currentUser.id, activity.studentId);
      if (!hasAccess) {
        throw new ForbiddenException('Solo puedes eliminar actividades de estudiantes en tus grupos');
      }
    }

    await this.activityRepository.remove(activity);

    return { message: 'Actividad eliminada exitosamente' };
  }

  async deleteActivitiesBatch(
    batchId: string,
    currentUser: User,
  ): Promise<{ message: string; count: number }> {
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden eliminar actividades');
    }

    // Find all activities with this batchId
    const activities = await this.activityRepository.find({
      where: { batchId },
      relations: ['student'],
    });

    if (activities.length === 0) {
      throw new NotFoundException('No se encontraron actividades para este grupo');
    }

    // Check teacher access for all activities
    if (currentUser.role === UserRole.TEACHER) {
      const studentIds = activities.map(a => a.studentId);
      const teacherStudentIds = await this.getTeacherStudentIds(currentUser.id);
      const hasAccessToAll = studentIds.every(id => teacherStudentIds.includes(id));

      if (!hasAccessToAll) {
        throw new ForbiddenException('Solo puedes eliminar actividades de estudiantes en tus grupos');
      }
    }

    // Delete all activities
    await this.activityRepository.remove(activities);

    return {
      message: 'Grupo de actividades eliminado exitosamente',
      count: activities.length
    };
  }

  // Private helper methods
  private async findAttendanceWithRelations(id: string): Promise<Attendance> {
    return this.attendanceRepository.findOne({
      where: { id },
      relations: ['student', 'student.parent', 'markedBy'],
    });
  }

  private async findActivityWithRelations(id: string): Promise<Activity> {
    return this.activityRepository.findOne({
      where: { id },
      relations: ['student', 'student.parent', 'assignedBy'],
    });
  }

  private async checkTeacherStudentAccess(teacherId: string, studentId: string): Promise<boolean> {
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.groups', 'groups')
      .leftJoin('groups.teacher', 'teacher')
      .where('student.id = :studentId', { studentId })
      .andWhere('teacher.id = :teacherId', { teacherId })
      .getOne();

    return !!student;
  }

  private async getTeacherStudentIds(teacherId: string): Promise<string[]> {
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.groups', 'groups')
      .leftJoin('groups.teacher', 'teacher')
      .where('teacher.id = :teacherId', { teacherId })
      .select('DISTINCT student.id', 'id')
      .getRawMany();

    return students.map(s => s.id);
  }

  private async getParentStudentIds(parentId: string): Promise<string[]> {
    const students = await this.studentRepository.find({
      where: { parentId },
      select: ['id'],
    });

    return students.map(s => s.id);
  }

  private async getGroupStudentIds(groupId: string): Promise<string[]> {
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.groups', 'groups')
      .where('groups.id = :groupId', { groupId })
      .select('DISTINCT student.id', 'id')
      .getRawMany();

    return students.map(s => s.id);
  }

  private formatAttendanceResponse(attendance: Attendance, userRole: UserRole): AttendanceResponseDto {
    const response: AttendanceResponseDto = {
      id: attendance.id,
      date: attendance.date,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      notes: attendance.notes,
      ate: attendance.ate,
      slept: attendance.slept,
      participatedInActivities: attendance.participatedInActivities,
      mood: attendance.mood,
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
      student: {
        id: attendance.student.id,
        firstName: attendance.student.firstName,
        lastName: attendance.student.lastName,
      },
      markedBy: {
        id: attendance.markedBy.id,
        firstName: attendance.markedBy.firstName,
        lastName: attendance.markedBy.lastName,
      },
    };

    // Add parent info based on role
    if (attendance.student.parent) {
      response.student.parent = {
        id: attendance.student.parent.id,
        firstName: attendance.student.parent.firstName,
        lastName: attendance.student.parent.lastName,
      };

      // Only admin sees parent contact info
      if (userRole === UserRole.ADMIN) {
        response.student.parent.email = attendance.student.parent.email;
        response.student.parent.phone = attendance.student.parent.phone;
      }
    }

    return response;
  }

  private formatActivityResponse(activity: Activity, userRole: UserRole): ActivityResponseDto {
    const response: ActivityResponseDto = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      status: activity.status,
      startTime: activity.startTime,
      endTime: activity.endTime,
      notes: activity.notes,
      batchId: activity.batchId,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      student: {
        id: activity.student.id,
        firstName: activity.student.firstName,
        lastName: activity.student.lastName,
      },
      assignedBy: {
        id: activity.assignedBy.id,
        firstName: activity.assignedBy.firstName,
        lastName: activity.assignedBy.lastName,
      },
    };

    // Add parent info based on role
    if (activity.student.parent) {
      response.student.parent = {
        id: activity.student.parent.id,
        firstName: activity.student.parent.firstName,
        lastName: activity.student.parent.lastName,
      };

      // Only admin sees parent contact info
      if (userRole === UserRole.ADMIN) {
        response.student.parent.email = activity.student.parent.email;
        response.student.parent.phone = activity.student.parent.phone;
      }
    }

    return response;
  }
}
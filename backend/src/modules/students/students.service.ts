import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { Student } from './student.entity';
import { User, UserRole, AuthProvider } from '../users/user.entity';
import { CreateStudentDto, UpdateStudentDto, StudentResponseDto } from './dto/student.dto';
import { EmailService } from '../../services/email.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async checkParentEmail(email: string, currentUser: User): Promise<any> {
    // Solo admin puede buscar información de padres
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No autorizado');
    }

    if (!email) {
      throw new BadRequestException('Email es requerido');
    }

    const existingParent = await this.userRepository.findOne({
      where: { email, role: UserRole.PARENT },
    });

    if (existingParent) {
      return {
        exists: true,
        parent: {
          id: existingParent.id,
          firstName: existingParent.firstName,
          lastName: existingParent.lastName,
          email: existingParent.email,
          phone: existingParent.phone,
        },
      };
    }

    return {
      exists: false,
      parent: null,
    };
  }

  async createStudent(
    createStudentDto: CreateStudentDto,
    currentUser: User,
  ): Promise<StudentResponseDto> {
    // Solo admin puede crear estudiantes
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden crear estudiantes');
    }

    let parent: User;
    let isNewParent = false;

    if (createStudentDto.parentId) {
      // Usar padre existente
      parent = await this.userRepository.findOne({
        where: { id: createStudentDto.parentId, role: UserRole.PARENT },
      });

      if (!parent) {
        throw new NotFoundException('Padre no encontrado');
      }
    } else if (createStudentDto.parentEmail) {
      // Verificar si el padre ya existe
      const existingUser = await this.userRepository.findOne({
        where: { email: createStudentDto.parentEmail },
      });

      if (existingUser) {
        // Si existe, usar ese usuario como padre
        if (existingUser.role !== UserRole.PARENT) {
          throw new BadRequestException('El email ya está registrado con un rol diferente');
        }
        parent = existingUser;
      } else {
        // Crear nuevo padre con token de reseteo de contraseña
        isNewParent = true;
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24); // 24 horas de validez

        parent = this.userRepository.create({
          email: createStudentDto.parentEmail,
          firstName: createStudentDto.parentFirstName || 'Padre',
          lastName: createStudentDto.parentLastName || 'Apellido',
          password: null, // Sin contraseña hasta que el padre la configure
          role: UserRole.PARENT,
          authProvider: AuthProvider.LOCAL,
          phone: createStudentDto.parentPhone,
          emailVerified: false,
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry,
          mustChangePassword: true,
        });

        await this.userRepository.save(parent);

        // Enviar email de invitación al padre
        try {
          const studentFullName = `${createStudentDto.firstName} ${createStudentDto.lastName}`;
          await this.emailService.sendParentInvitationEmail(
            parent.email,
            parent.firstName,
            studentFullName,
            resetToken,
          );
        } catch (error) {
          console.error('Error sending parent invitation email:', error);
          // No fallar la creación del estudiante si el email no se puede enviar
        }
      }
    } else {
      throw new BadRequestException('Debe proporcionar un padre existente o información para crear uno nuevo');
    }

    const student = this.studentRepository.create({
      firstName: createStudentDto.firstName,
      lastName: createStudentDto.lastName,
      birthDate: new Date(createStudentDto.birthDate),
      gender: createStudentDto.gender,
      allergies: createStudentDto.allergies,
      observations: createStudentDto.observations,
      emergencyContact: createStudentDto.emergencyContact,
      emergencyPhone: createStudentDto.emergencyPhone,
      parent,
    });

    const savedStudent = await this.studentRepository.save(student);

    const response = this.formatStudentResponse(savedStudent, currentUser.role);

    // Agregar información si se envió invitación
    if (isNewParent) {
      return {
        ...response,
        parentInvitationSent: true,
      } as any;
    }

    return response;
  }

  async findAll(currentUser: User): Promise<StudentResponseDto[]> {
    console.log('StudentsService.findAll - currentUser:', {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      firstName: currentUser.firstName
    });

    let students: Student[];

    switch (currentUser.role) {
      case UserRole.ADMIN:
        // Admin ve todos los estudiantes
        students = await this.studentRepository.find({
          relations: ['parent', 'groups'],
          order: {
            lastName: 'ASC',
            firstName: 'ASC',
          },
        });
        console.log('StudentsService.findAll - Admin found students:', students.length);
        break;

      case UserRole.TEACHER:
        // Teacher ve estudiantes de sus grupos
        students = await this.studentRepository
          .createQueryBuilder('student')
          .leftJoinAndSelect('student.parent', 'parent')
          .leftJoinAndSelect('student.groups', 'groups')
          .leftJoin('groups.teacher', 'teacher')
          .where('teacher.id = :teacherId', { teacherId: currentUser.id })
          .orderBy('student.lastName', 'ASC')
          .addOrderBy('student.firstName', 'ASC')
          .getMany();
        console.log('StudentsService.findAll - Teacher found students:', students.length);
        break;

      case UserRole.PARENT:
        // Parent ve solo sus hijos
        console.log('StudentsService.findAll - Parent query with parentId:', currentUser.id);
        students = await this.studentRepository.find({
          where: { parentId: currentUser.id },
          relations: ['parent', 'groups'],
          order: {
            lastName: 'ASC',
            firstName: 'ASC',
          },
        });
        console.log('StudentsService.findAll - Parent found students:', students.length);
        console.log('StudentsService.findAll - Parent students details:', students.map(s => ({
          id: s.id,
          name: s.firstName + ' ' + s.lastName,
          parentId: s.parentId,
          parentName: s.parent?.firstName + ' ' + s.parent?.lastName
        })));
        break;

      default:
        throw new ForbiddenException('No autorizado');
    }

    return students.map(student => this.formatStudentResponse(student, currentUser.role));
  }

  async findOne(id: string, currentUser: User): Promise<StudentResponseDto> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['parent', 'groups'],
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar permisos
    if (currentUser.role === UserRole.PARENT && student.parentId !== currentUser.id) {
      throw new ForbiddenException('Solo puedes ver información de tus propios hijos');
    }

    if (currentUser.role === UserRole.TEACHER) {
      // Verificar si el maestro tiene al estudiante en alguno de sus grupos
      const hasAccess = student.groups.some(group => group.teacher?.id === currentUser.id);
      if (!hasAccess) {
        throw new ForbiddenException('Solo puedes ver estudiantes de tus grupos');
      }
    }

    return this.formatStudentResponse(student, currentUser.role);
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    currentUser: User,
  ): Promise<StudentResponseDto> {
    // Solo admin puede editar estudiantes
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden editar estudiantes');
    }

    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['parent', 'groups'],
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Actualizar campos del estudiante
    Object.assign(student, {
      firstName: updateStudentDto.firstName,
      lastName: updateStudentDto.lastName,
      gender: updateStudentDto.gender,
      allergies: updateStudentDto.allergies,
      observations: updateStudentDto.observations,
      emergencyContact: updateStudentDto.emergencyContact,
      emergencyPhone: updateStudentDto.emergencyPhone,
    });

    if (updateStudentDto.birthDate) {
      student.birthDate = new Date(updateStudentDto.birthDate);
    }

    // Manejar cambio de padre o actualización de información del padre
    if (updateStudentDto.parentId) {
      // Caso 1: Cambiar a un padre existente por ID
      const parent = await this.userRepository.findOne({
        where: { id: updateStudentDto.parentId, role: UserRole.PARENT },
      });

      if (!parent) {
        throw new NotFoundException('Padre no encontrado');
      }

      student.parent = parent;
    } else if (updateStudentDto.parentEmail) {
      // Caso 2: Verificar si el email corresponde a un padre diferente
      const newEmail = updateStudentDto.parentEmail.trim().toLowerCase();
      const currentEmail = student.parent?.email?.trim().toLowerCase();

      if (newEmail !== currentEmail) {
        // Buscar si existe un padre con este email
        const existingParent = await this.userRepository.findOne({
          where: { email: updateStudentDto.parentEmail, role: UserRole.PARENT },
        });

        if (existingParent) {
          // Cambiar el estudiante a este padre existente
          student.parent = existingParent;
        } else {
          // El email no existe, actualizar el padre actual
          if (student.parent) {
            if (updateStudentDto.parentFirstName) student.parent.firstName = updateStudentDto.parentFirstName;
            if (updateStudentDto.parentLastName) student.parent.lastName = updateStudentDto.parentLastName;
            if (updateStudentDto.parentEmail) student.parent.email = updateStudentDto.parentEmail;
            if (updateStudentDto.parentPhone) student.parent.phone = updateStudentDto.parentPhone;

            await this.userRepository.save(student.parent);
          }
        }
      } else {
        // El email no cambió, solo actualizar otros campos del padre actual
        if (student.parent) {
          if (updateStudentDto.parentFirstName) student.parent.firstName = updateStudentDto.parentFirstName;
          if (updateStudentDto.parentLastName) student.parent.lastName = updateStudentDto.parentLastName;
          if (updateStudentDto.parentPhone) student.parent.phone = updateStudentDto.parentPhone;

          await this.userRepository.save(student.parent);
        }
      }
    } else if (student.parent && (updateStudentDto.parentFirstName || updateStudentDto.parentLastName || updateStudentDto.parentPhone)) {
      // Caso 3: Solo actualizar otros campos sin cambiar email
      if (updateStudentDto.parentFirstName) student.parent.firstName = updateStudentDto.parentFirstName;
      if (updateStudentDto.parentLastName) student.parent.lastName = updateStudentDto.parentLastName;
      if (updateStudentDto.parentPhone) student.parent.phone = updateStudentDto.parentPhone;

      await this.userRepository.save(student.parent);
    }

    const updatedStudent = await this.studentRepository.save(student);
    return this.formatStudentResponse(updatedStudent, currentUser.role);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    // Solo admin puede eliminar estudiantes
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden eliminar estudiantes');
    }

    const student = await this.studentRepository.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    await this.studentRepository.remove(student);
  }

  async getUpcomingBirthdays(daysAhead: number, currentUser: User): Promise<any[]> {
    // Get all students based on user role
    const students = await this.findAll(currentUser);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBirthdays = students
      .map(student => {
        const birthDate = new Date(student.birthDate);
        const currentYear = today.getFullYear();

        // Calculate this year's birthday
        let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        nextBirthday.setHours(0, 0, 0, 0);

        // If birthday already passed this year, use next year
        if (nextBirthday < today) {
          nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
        }

        // Calculate days until birthday
        const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate age they will turn
        const age = nextBirthday.getFullYear() - birthDate.getFullYear();

        return {
          ...student,
          nextBirthday: nextBirthday.toISOString(),
          daysUntilBirthday: daysUntil,
          turningAge: age,
        };
      })
      .filter(student => student.daysUntilBirthday >= 0 && student.daysUntilBirthday <= daysAhead)
      .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

    return upcomingBirthdays;
  }

  private formatStudentResponse(student: Student, userRole: UserRole): StudentResponseDto {
    const response: StudentResponseDto = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate,
      gender: student.gender,
      allergies: student.allergies,
      observations: student.observations,
      emergencyContact: student.emergencyContact,
      emergencyPhone: student.emergencyPhone,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };

    // Información del padre (con restricciones según rol)
    if (student.parent) {
      response.parent = {
        id: student.parent.id,
        firstName: student.parent.firstName,
        lastName: student.parent.lastName,
      };

      // Solo admin ve email y teléfono del padre
      if (userRole === UserRole.ADMIN) {
        response.parent.email = student.parent.email;
        response.parent.phone = student.parent.phone;
      }
    }

    // Información de grupos
    if (student.groups) {
      response.groups = student.groups.map(group => ({
        id: group.id,
        name: group.name,
        color: group.color,
      }));
    }

    return response;
  }
}
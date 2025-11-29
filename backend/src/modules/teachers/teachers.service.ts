import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole, AuthProvider } from '../users/user.entity';
import { CreateTeacherDto, UpdateTeacherDto, TeacherResponseDto } from './dto/teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createTeacher(
    createTeacherDto: CreateTeacherDto,
    currentUser: User,
  ): Promise<TeacherResponseDto> {
    // Solo admin puede crear maestros
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden crear maestros');
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await this.userRepository.findOne({
      where: { email: createTeacherDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    // Usar contraseña por defecto si no se proporciona
    const defaultPassword = 'mundodeniños123';
    const password = createTeacherDto.password || defaultPassword;

    // Crear el maestro
    const teacher = this.userRepository.create({
      email: createTeacherDto.email,
      firstName: createTeacherDto.firstName,
      lastName: createTeacherDto.lastName,
      password: password, // Se hashea automáticamente en @BeforeInsert
      role: UserRole.TEACHER,
      authProvider: AuthProvider.LOCAL,
      phone: createTeacherDto.phone,
      emailVerified: false,
      mustChangePassword: false, // Teachers use generic accounts, no password change required
      preferences: {
        specialization: createTeacherDto.specialization || '',
        bio: createTeacherDto.bio || '',
        certifications: createTeacherDto.certifications || '',
      },
    });

    const savedTeacher = await this.userRepository.save(teacher);
    return this.formatTeacherResponse(savedTeacher);
  }

  async findAll(currentUser: User): Promise<TeacherResponseDto[]> {
    // Solo admin puede ver todos los maestros
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden ver todos los maestros');
    }

    const teachers = await this.userRepository.find({
      where: { role: UserRole.TEACHER },
      relations: ['groups'],
      order: {
        lastName: 'ASC',
        firstName: 'ASC',
      },
    });

    return teachers.map(teacher => this.formatTeacherResponse(teacher));
  }

  async findOne(id: string, currentUser: User): Promise<TeacherResponseDto> {
    // Admin puede ver cualquier maestro, maestro solo puede ver su propio perfil
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('No tienes permisos para ver este perfil');
    }

    const teacher = await this.userRepository.findOne({
      where: { id, role: UserRole.TEACHER },
      relations: ['groups'],
    });

    if (!teacher) {
      throw new NotFoundException('Maestro no encontrado');
    }

    return this.formatTeacherResponse(teacher);
  }

  async update(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
    currentUser: User,
  ): Promise<TeacherResponseDto> {
    // Admin puede editar cualquier maestro, maestro puede editar su propio perfil
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('Solo los administradores pueden editar otros maestros');
    }

    let teacher = await this.userRepository.findOne({
      where: { id, role: UserRole.TEACHER },
      relations: ['groups'],
    });

    if (!teacher) {
      throw new NotFoundException('Maestro no encontrado');
    }

    // Si se intenta cambiar el email, verificar que no exista
    if (updateTeacherDto.email && updateTeacherDto.email !== teacher.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateTeacherDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }
    }

    // Actualizar campos básicos
    if (updateTeacherDto.firstName) teacher.firstName = updateTeacherDto.firstName;
    if (updateTeacherDto.lastName) teacher.lastName = updateTeacherDto.lastName;
    if (updateTeacherDto.email) teacher.email = updateTeacherDto.email;
    if (updateTeacherDto.phone !== undefined) teacher.phone = updateTeacherDto.phone;
    if (updateTeacherDto.isActive !== undefined && currentUser.role === UserRole.ADMIN) {
      teacher.isActive = updateTeacherDto.isActive;
    }

    // Permitir que admin cambie la contraseña del maestro
    if (updateTeacherDto.password && currentUser.role === UserRole.ADMIN) {
      // Hash the password manually to ensure it's updated
      const hashedPassword = await bcrypt.hash(updateTeacherDto.password, 10);

      // Use update method directly to force the change
      await this.userRepository.update(teacher.id, {
        password: hashedPassword,
      });

      // Reload the entity to get the updated password
      const reloadedTeacher = await this.userRepository.findOne({
        where: { id: teacher.id },
        relations: ['groups'],
      });

      if (reloadedTeacher) {
        teacher = reloadedTeacher;
      }
    }

    // Actualizar preferencias (campos específicos de maestro)
    const preferences = teacher.preferences || {};
    if (updateTeacherDto.specialization !== undefined) {
      preferences.specialization = updateTeacherDto.specialization;
    }
    if (updateTeacherDto.bio !== undefined) {
      preferences.bio = updateTeacherDto.bio;
    }
    if (updateTeacherDto.certifications !== undefined) {
      preferences.certifications = updateTeacherDto.certifications;
    }
    teacher.preferences = preferences;

    const updatedTeacher = await this.userRepository.save(teacher);
    return this.formatTeacherResponse(updatedTeacher);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    // Solo admin puede eliminar maestros
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden eliminar maestros');
    }

    const teacher = await this.userRepository.findOne({
      where: { id, role: UserRole.TEACHER },
    });

    if (!teacher) {
      throw new NotFoundException('Maestro no encontrado');
    }

    // En lugar de eliminar, desactivar el maestro
    teacher.isActive = false;
    await this.userRepository.save(teacher);
  }

  private formatTeacherResponse(teacher: User): TeacherResponseDto {
    const preferences = teacher.preferences || {};

    const response: TeacherResponseDto = {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone,
      specialization: preferences.specialization || '',
      bio: preferences.bio || '',
      certifications: preferences.certifications || '',
      isActive: teacher.isActive,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };

    // Información de grupos
    if (teacher.groups) {
      response.groups = teacher.groups.map(group => ({
        id: group.id,
        name: group.name,
        color: group.color,
        studentCount: group.students?.length || 0,
      }));
    }

    return response;
  }
}

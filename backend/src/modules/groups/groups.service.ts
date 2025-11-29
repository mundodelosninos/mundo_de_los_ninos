import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Group } from './group.entity';
import { User, UserRole } from '../users/user.entity';
import { Student } from '../students/student.entity';
import { CreateGroupDto, UpdateGroupDto, AddStudentsToGroupDto, GroupResponseDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async createGroup(
    createGroupDto: CreateGroupDto,
    currentUser: User,
  ): Promise<GroupResponseDto> {
    // Solo admin y teacher pueden crear grupos
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden crear grupos');
    }

    let teacher: User;

    if (createGroupDto.teacherId) {
      // Admin puede asignar cualquier maestro
      if (currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Solo los administradores pueden asignar maestros a grupos');
      }

      teacher = await this.userRepository.findOne({
        where: { id: createGroupDto.teacherId, role: UserRole.TEACHER },
      });

      if (!teacher) {
        throw new NotFoundException('Maestro no encontrado');
      }
    } else {
      // Si no se especifica maestro y es teacher, se asigna a sí mismo
      if (currentUser.role === UserRole.TEACHER) {
        teacher = currentUser;
      } else {
        throw new BadRequestException('Debe especificar un maestro para el grupo');
      }
    }

    const group = this.groupRepository.create({
      name: createGroupDto.name,
      description: createGroupDto.description,
      color: createGroupDto.color || '#3B82F6',
      maxStudents: createGroupDto.maxStudents || 20,
      teacher,
    });

    const savedGroup = await this.groupRepository.save(group);

    // Agregar estudiantes si se especificaron
    if (createGroupDto.studentIds && createGroupDto.studentIds.length > 0) {
      await this.addStudentsToGroup(savedGroup.id, { studentIds: createGroupDto.studentIds }, currentUser);
    }

    return this.formatGroupResponse(await this.findGroupWithRelations(savedGroup.id), currentUser.role);
  }

  async findAll(currentUser: User): Promise<GroupResponseDto[]> {
    let groups: Group[];

    switch (currentUser.role) {
      case UserRole.ADMIN:
        // Admin ve todos los grupos
        groups = await this.groupRepository.find({
          relations: ['teacher', 'students', 'students.parent'],
          where: { isActive: true },
        });
        break;

      case UserRole.TEACHER:
        // Teacher ve solo sus grupos
        groups = await this.groupRepository.find({
          where: { teacherId: currentUser.id, isActive: true },
          relations: ['teacher', 'students', 'students.parent'],
        });
        break;

      case UserRole.PARENT:
        // Parent ve solo los grupos de sus hijos
        const groupIds = await this.groupRepository
          .createQueryBuilder('group')
          .innerJoin('group.students', 'student')
          .where('group.isActive = :isActive', { isActive: true })
          .andWhere('student.parentId = :parentId', { parentId: currentUser.id })
          .select('DISTINCT group.id', 'id')
          .getRawMany();

        if (groupIds.length === 0) {
          groups = [];
        } else {
          groups = await this.groupRepository.find({
            where: { id: In(groupIds.map(g => g.id)) },
            relations: ['teacher', 'students', 'students.parent'],
          });
        }
        break;

      default:
        throw new ForbiddenException('No autorizado');
    }

    return groups.map(group => this.formatGroupResponse(group, currentUser.role));
  }

  async findOne(id: string, currentUser: User): Promise<GroupResponseDto> {
    const group = await this.findGroupWithRelations(id);

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Verificar permisos
    if (currentUser.role === UserRole.TEACHER && group.teacherId !== currentUser.id) {
      throw new ForbiddenException('Solo puedes ver tus propios grupos');
    }

    if (currentUser.role === UserRole.PARENT) {
      // Verificar si el padre tiene algún hijo en este grupo
      const hasChildren = group.students.some(student => student.parentId === currentUser.id);
      if (!hasChildren) {
        throw new ForbiddenException('Solo puedes ver grupos donde están tus hijos');
      }
    }

    return this.formatGroupResponse(group, currentUser.role);
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
    currentUser: User,
  ): Promise<GroupResponseDto> {
    const group = await this.findGroupWithRelations(id);

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Verificar permisos de edición
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden editar grupos');
    }

    if (currentUser.role === UserRole.TEACHER && group.teacherId !== currentUser.id) {
      throw new ForbiddenException('Solo puedes editar tus propios grupos');
    }

    // Solo admin puede cambiar el maestro asignado
    if (updateGroupDto.teacherId && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden cambiar el maestro asignado');
    }

    // Actualizar campos básicos
    if (updateGroupDto.name) group.name = updateGroupDto.name;
    if (updateGroupDto.description !== undefined) group.description = updateGroupDto.description;
    if (updateGroupDto.color) group.color = updateGroupDto.color;
    if (updateGroupDto.maxStudents) group.maxStudents = updateGroupDto.maxStudents;

    // Cambiar maestro si se especifica
    if (updateGroupDto.teacherId) {
      const teacher = await this.userRepository.findOne({
        where: { id: updateGroupDto.teacherId, role: UserRole.TEACHER },
      });

      if (!teacher) {
        throw new NotFoundException('Maestro no encontrado');
      }

      group.teacher = teacher;
      group.teacherId = teacher.id;
    }

    const updatedGroup = await this.groupRepository.save(group);

    // Actualizar estudiantes si se especificaron
    if (updateGroupDto.studentIds) {
      await this.updateGroupStudents(id, updateGroupDto.studentIds, currentUser);
    }

    return this.formatGroupResponse(await this.findGroupWithRelations(updatedGroup.id), currentUser.role);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Verificar permisos de eliminación
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden eliminar grupos');
    }

    if (currentUser.role === UserRole.TEACHER && group.teacherId !== currentUser.id) {
      throw new ForbiddenException('Solo puedes eliminar tus propios grupos');
    }

    // Soft delete
    group.isActive = false;
    await this.groupRepository.save(group);
  }

  async addStudentsToGroup(
    groupId: string,
    addStudentsDto: AddStudentsToGroupDto,
    currentUser: User,
  ): Promise<GroupResponseDto> {
    const group = await this.findGroupWithRelations(groupId);

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Verificar permisos
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden agregar estudiantes a grupos');
    }

    if (currentUser.role === UserRole.TEACHER && group.teacherId !== currentUser.id) {
      throw new ForbiddenException('Solo puedes modificar tus propios grupos');
    }

    // Verificar límite de estudiantes
    const currentStudentCount = group.students.length;
    const newStudentsCount = addStudentsDto.studentIds.length;

    if (group.maxStudents && (currentStudentCount + newStudentsCount) > group.maxStudents) {
      throw new BadRequestException(`El grupo excedería el límite máximo de ${group.maxStudents} estudiantes`);
    }

    // Buscar estudiantes
    const students = await this.studentRepository.findByIds(addStudentsDto.studentIds);

    if (students.length !== addStudentsDto.studentIds.length) {
      throw new NotFoundException('Algunos estudiantes no fueron encontrados');
    }

    // Filtrar estudiantes que ya están en el grupo
    const existingStudentIds = group.students.map(s => s.id);
    const newStudents = students.filter(s => !existingStudentIds.includes(s.id));

    if (newStudents.length === 0) {
      throw new BadRequestException('Todos los estudiantes ya están en el grupo');
    }

    // Agregar estudiantes al grupo
    group.students = [...group.students, ...newStudents];
    await this.groupRepository.save(group);

    return this.formatGroupResponse(await this.findGroupWithRelations(groupId), currentUser.role);
  }

  async removeStudentFromGroup(
    groupId: string,
    studentId: string,
    currentUser: User,
  ): Promise<GroupResponseDto> {
    const group = await this.findGroupWithRelations(groupId);

    if (!group) {
      throw new NotFoundException('Grupo no encontrado');
    }

    // Verificar permisos
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Los padres no pueden remover estudiantes de grupos');
    }

    if (currentUser.role === UserRole.TEACHER && group.teacherId !== currentUser.id) {
      throw new ForbiddenException('Solo puedes modificar tus propios grupos');
    }

    // Verificar que el estudiante esté en el grupo
    const studentIndex = group.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      throw new NotFoundException('Estudiante no encontrado en el grupo');
    }

    // Remover estudiante del grupo
    group.students.splice(studentIndex, 1);
    await this.groupRepository.save(group);

    return this.formatGroupResponse(await this.findGroupWithRelations(groupId), currentUser.role);
  }

  private async findGroupWithRelations(id: string): Promise<Group> {
    return this.groupRepository.findOne({
      where: { id },
      relations: ['teacher', 'students', 'students.parent'],
    });
  }

  private async updateGroupStudents(groupId: string, studentIds: string[], currentUser: User): Promise<void> {
    const group = await this.findGroupWithRelations(groupId);

    // Buscar estudiantes
    const students = await this.studentRepository.findByIds(studentIds);

    if (students.length !== studentIds.length) {
      throw new NotFoundException('Algunos estudiantes no fueron encontrados');
    }

    // Verificar límite de estudiantes
    if (group.maxStudents && students.length > group.maxStudents) {
      throw new BadRequestException(`El grupo excedería el límite máximo de ${group.maxStudents} estudiantes`);
    }

    // Actualizar estudiantes
    group.students = students;
    await this.groupRepository.save(group);
  }

  private formatGroupResponse(group: Group, userRole: UserRole): GroupResponseDto {
    const response: GroupResponseDto = {
      id: group.id,
      name: group.name,
      description: group.description,
      color: group.color,
      maxStudents: group.maxStudents,
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      studentCount: group.students?.length || 0,
    };

    // Información del maestro
    if (group.teacher) {
      response.teacher = {
        id: group.teacher.id,
        firstName: group.teacher.firstName,
        lastName: group.teacher.lastName,
      };

      // Solo admin ve email del maestro
      if (userRole === UserRole.ADMIN) {
        response.teacher.email = group.teacher.email;
      }
    }

    // Información de estudiantes
    if (group.students) {
      response.students = group.students.map(student => {
        const studentData: any = {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          birthDate: student.birthDate,
          gender: student.gender,
        };

        // Información del padre (con restricciones según rol)
        if (student.parent) {
          studentData.parent = {
            id: student.parent.id,
            firstName: student.parent.firstName,
            lastName: student.parent.lastName,
          };

          // Solo admin ve email y teléfono del padre
          if (userRole === UserRole.ADMIN) {
            studentData.parent.email = student.parent.email;
            studentData.parent.phone = student.parent.phone;
          }
        }

        return studentData;
      });

      // Si es padre, filtrar solo sus hijos
      if (userRole === UserRole.PARENT) {
        response.students = response.students.filter(
          student => student.parent?.id === group.students.find(s => s.id === student.id)?.parentId
        );
      }
    }

    return response;
  }
}
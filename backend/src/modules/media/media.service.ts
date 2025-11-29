import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { StudentMedia } from './student-media.entity';
import { Student } from '../students/student.entity';
import { User, UserRole } from '../users/user.entity';
import { Group } from '../groups/group.entity';
import { StorageService } from '../../services/storage.service';
import {
  CreateMediaDto,
  UpdateMediaDto,
  QueryMediaDto,
  MediaResponseDto,
} from './dto/media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(StudentMedia)
    private readonly mediaRepository: Repository<StudentMedia>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Create a new media entry
   * Only Admins and Teachers can upload
   */
  async create(
    createMediaDto: CreateMediaDto,
    currentUser: User,
  ): Promise<MediaResponseDto> {
    // Only admins and teachers can upload
    if (currentUser.role === UserRole.PARENT) {
      throw new ForbiddenException('Parents cannot upload media');
    }

    // Validate that all students exist and user has access to them
    const students = await this.studentRepository.find({
      where: { id: In(createMediaDto.studentIds) },
      relations: ['parent'],
    });

    if (students.length !== createMediaDto.studentIds.length) {
      throw new BadRequestException('Some students were not found');
    }

    // Teachers can only tag students in their groups
    if (currentUser.role === UserRole.TEACHER) {
      const teacherGroups = await this.groupRepository.find({
        where: { teacher: { id: currentUser.id } },
        relations: ['students'],
      });

      const teacherStudentIds = new Set(
        teacherGroups.flatMap((group) => group.students.map((s) => s.id)),
      );

      const invalidStudents = students.filter(
        (student) => !teacherStudentIds.has(student.id),
      );

      if (invalidStudents.length > 0) {
        throw new ForbiddenException(
          'Teachers can only tag students in their groups',
        );
      }
    }

    // Create the media entry
    const media = this.mediaRepository.create({
      ...createMediaDto,
      students,
      uploadedBy: currentUser,
      uploadedById: currentUser.id,
    });

    const savedMedia = await this.mediaRepository.save(media);

    return this.formatMediaResponse(savedMedia, currentUser);
  }

  /**
   * Get all media with filters
   * Returns only media the user has permission to see
   */
  async findAll(
    query: QueryMediaDto,
    currentUser: User,
  ): Promise<MediaResponseDto[]> {
    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('media.students', 'students')
      .leftJoinAndSelect('students.parent', 'parent');

    // Apply filters
    if (query.mediaType) {
      queryBuilder.andWhere('media.mediaType = :mediaType', {
        mediaType: query.mediaType,
      });
    }

    if (query.fromDate) {
      queryBuilder.andWhere('media.uploadedAt >= :fromDate', {
        fromDate: query.fromDate,
      });
    }

    if (query.toDate) {
      queryBuilder.andWhere('media.uploadedAt <= :toDate', {
        toDate: query.toDate,
      });
    }

    if (query.uploadedById) {
      queryBuilder.andWhere('media.uploadedById = :uploadedById', {
        uploadedById: query.uploadedById,
      });
    }

    // Role-based filtering
    if (currentUser.role === UserRole.PARENT) {
      // Parents can only see media of their children
      const children = await this.studentRepository.find({
        where: { parent: { id: currentUser.id } },
      });

      const childrenIds = children.map((c) => c.id);

      if (childrenIds.length === 0) {
        return [];
      }

      queryBuilder.andWhere('students.id IN (:...childrenIds)', {
        childrenIds,
      });
    } else if (currentUser.role === UserRole.TEACHER) {
      // Teachers can see media they uploaded or media of students in their groups
      const teacherGroups = await this.groupRepository.find({
        where: { teacher: { id: currentUser.id } },
        relations: ['students'],
      });

      const teacherStudentIds = teacherGroups.flatMap((group) =>
        group.students.map((s) => s.id),
      );

      if (teacherStudentIds.length === 0) {
        // If no students, only show media uploaded by this teacher
        queryBuilder.andWhere('media.uploadedById = :currentUserId', {
          currentUserId: currentUser.id,
        });
      } else {
        queryBuilder.andWhere(
          '(media.uploadedById = :currentUserId OR students.id IN (:...teacherStudentIds))',
          {
            currentUserId: currentUser.id,
            teacherStudentIds,
          },
        );
      }
    }

    // If studentId filter is provided, apply it
    if (query.studentId) {
      queryBuilder.andWhere('students.id = :studentId', {
        studentId: query.studentId,
      });
    }

    // Order by newest first
    queryBuilder.orderBy('media.uploadedAt', 'DESC');

    const mediaList = await queryBuilder.getMany();

    return mediaList.map((media) => this.formatMediaResponse(media, currentUser));
  }

  /**
   * Get a single media by ID
   * Checks if user has permission to access it
   */
  async findOne(id: string, currentUser: User): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'students', 'students.parent'],
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check permissions
    if (!this.canUserAccessMedia(media, currentUser)) {
      throw new ForbiddenException('You do not have permission to access this media');
    }

    return this.formatMediaResponse(media, currentUser);
  }

  /**
   * Update media metadata (description and student tags)
   * Only uploader or admin can update
   */
  async update(
    id: string,
    updateMediaDto: UpdateMediaDto,
    currentUser: User,
  ): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'students'],
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Only uploader or admin can update
    if (
      currentUser.role !== UserRole.ADMIN &&
      media.uploadedById !== currentUser.id
    ) {
      throw new ForbiddenException('You can only update media you uploaded');
    }

    // Update description if provided
    if (updateMediaDto.description !== undefined) {
      media.description = updateMediaDto.description;
    }

    // Update student tags if provided
    if (updateMediaDto.studentIds) {
      const students = await this.studentRepository.find({
        where: { id: In(updateMediaDto.studentIds) },
        relations: ['parent'],
      });

      if (students.length !== updateMediaDto.studentIds.length) {
        throw new BadRequestException('Some students were not found');
      }

      // Teachers can only tag students in their groups
      if (currentUser.role === UserRole.TEACHER) {
        const teacherGroups = await this.groupRepository.find({
          where: { teacher: { id: currentUser.id } },
          relations: ['students'],
        });

        const teacherStudentIds = new Set(
          teacherGroups.flatMap((group) => group.students.map((s) => s.id)),
        );

        const invalidStudents = students.filter(
          (student) => !teacherStudentIds.has(student.id),
        );

        if (invalidStudents.length > 0) {
          throw new ForbiddenException(
            'Teachers can only tag students in their groups',
          );
        }
      }

      media.students = students;
    }

    const updatedMedia = await this.mediaRepository.save(media);

    return this.formatMediaResponse(updatedMedia, currentUser);
  }

  /**
   * Delete media
   * Only uploader or admin can delete
   * Also deletes the file from R2 storage
   */
  async delete(id: string, currentUser: User): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Only uploader or admin can delete
    if (
      currentUser.role !== UserRole.ADMIN &&
      media.uploadedById !== currentUser.id
    ) {
      throw new ForbiddenException('You can only delete media you uploaded');
    }

    // Delete file from R2
    try {
      await this.storageService.deleteFile(media.fileKey);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      // Continue with database deletion even if R2 deletion fails
    }

    // Delete from database
    await this.mediaRepository.remove(media);
  }

  /**
   * Check if user can access a specific media
   */
  private canUserAccessMedia(media: StudentMedia, user: User): boolean {
    // Admin can access all
    if (user.role === UserRole.ADMIN) return true;

    // Teacher can access if they uploaded it
    if (user.role === UserRole.TEACHER && media.uploadedById === user.id) {
      return true;
    }

    // Parent can access if any of their children are tagged
    if (user.role === UserRole.PARENT) {
      return media.students.some((student) => student.parent?.id === user.id);
    }

    // Teacher can access if any tagged student is in their groups
    // This requires additional query, so we'll handle it in the controller/guard if needed

    return false;
  }

  /**
   * Format media entity to response DTO
   */
  private formatMediaResponse(
    media: StudentMedia,
    currentUser: User,
  ): MediaResponseDto {
    const response: MediaResponseDto = {
      id: media.id,
      fileName: media.fileName,
      originalFileName: media.originalFileName,
      fileUrl: media.fileUrl,
      fileKey: media.fileKey,
      mediaType: media.mediaType,
      mimeType: media.mimeType,
      fileSize: media.fileSize,
      description: media.description,
      uploadedAt: media.uploadedAt,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };

    // Include uploader info (hide email from parents)
    if (media.uploadedBy) {
      response.uploadedBy = {
        id: media.uploadedBy.id,
        firstName: media.uploadedBy.firstName,
        lastName: media.uploadedBy.lastName,
        email:
          currentUser.role !== UserRole.PARENT
            ? media.uploadedBy.email
            : undefined,
        role: media.uploadedBy.role,
      };
    }

    // Include tagged students
    if (media.students) {
      response.students = media.students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
      }));
    }

    return response;
  }
}

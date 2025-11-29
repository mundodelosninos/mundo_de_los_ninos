import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { MediaService } from './media.service';
import { StorageService } from '../../services/storage.service';
import {
  CreateMediaDto,
  UpdateMediaDto,
  QueryMediaDto,
  MediaResponseDto,
} from './dto/media.dto';
import { MediaType } from './student-media.entity';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Upload a new photo or document
   * Uploads file to R2 and creates database entry with student tags
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body('mediaType') mediaType: MediaType,
    @Body('description') description: string,
    @Body('studentIds') studentIds: string,
    @CurrentUser() currentUser: User,
  ): Promise<MediaResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!mediaType || !Object.values(MediaType).includes(mediaType)) {
      throw new BadRequestException('Valid media type is required (photo or document)');
    }

    if (!studentIds) {
      throw new BadRequestException('At least one student must be tagged');
    }

    // Parse studentIds (can be JSON array or comma-separated string)
    let studentIdArray: string[];
    try {
      studentIdArray = JSON.parse(studentIds);
    } catch {
      studentIdArray = studentIds.split(',').map((id) => id.trim());
    }

    if (!Array.isArray(studentIdArray) || studentIdArray.length === 0) {
      throw new BadRequestException('At least one student must be tagged');
    }

    if (!this.storageService.isConfigured()) {
      throw new BadRequestException('File storage is not configured');
    }

    try {
      // Upload file to R2
      const folder = mediaType === MediaType.PHOTO ? 'photos' : 'documents';
      const uploadResult = await this.storageService.uploadFile(file, folder);

      // Create media entry in database
      const createMediaDto: CreateMediaDto = {
        fileName: uploadResult.key.split('/').pop() || file.originalname,
        originalFileName: file.originalname,
        fileUrl: uploadResult.url,
        fileKey: uploadResult.key,
        mediaType,
        mimeType: file.mimetype,
        fileSize: file.size,
        description: description || undefined,
        studentIds: studentIdArray,
      };

      const media = await this.mediaService.create(createMediaDto, currentUser);

      return media;
    } catch (error) {
      // If database save fails, try to clean up uploaded file
      console.error('Error creating media:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Upload failed: ${errorMessage}`);
    }
  }

  /**
   * Get all media (filtered by user role and query parameters)
   */
  @Get()
  async findAll(
    @Query() query: QueryMediaDto,
    @CurrentUser() currentUser: User,
  ): Promise<MediaResponseDto[]> {
    return this.mediaService.findAll(query, currentUser);
  }

  /**
   * Get a specific media by ID
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<MediaResponseDto> {
    return this.mediaService.findOne(id, currentUser);
  }

  /**
   * Update media metadata (description and student tags)
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @CurrentUser() currentUser: User,
  ): Promise<MediaResponseDto> {
    return this.mediaService.update(id, updateMediaDto, currentUser);
  }

  /**
   * Delete media (removes from database and R2 storage)
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ success: boolean; message: string }> {
    await this.mediaService.delete(id, currentUser);

    return {
      success: true,
      message: 'Media deleted successfully',
    };
  }

  /**
   * Get signed URL for private media access
   * (Useful if you want to make files private and generate temporary access URLs)
   */
  @Post(':id/signed-url')
  async getSignedUrl(
    @Param('id') id: string,
    @Body('expiresIn') expiresIn: number = 3600,
    @CurrentUser() currentUser: User,
  ): Promise<{ url: string; expiresIn: number }> {
    // First check if user has access to this media
    const media = await this.mediaService.findOne(id, currentUser);

    if (!this.storageService.isConfigured()) {
      throw new BadRequestException('File storage is not configured');
    }

    try {
      const url = await this.storageService.getSignedUrl(
        media.fileKey,
        expiresIn,
      );

      return {
        url,
        expiresIn,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to generate signed URL: ${errorMessage}`);
    }
  }
}

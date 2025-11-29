import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from '../../services/storage.service';

@Controller('files')
export class FilesController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Health check endpoint - Test if R2 is configured and accessible
   */
  @Get('health')
  async healthCheck() {
    const health = await this.storageService.healthCheck();
    return {
      timestamp: new Date().toISOString(),
      r2Storage: health,
    };
  }

  /**
   * Upload a test file to R2
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.storageService.isConfigured()) {
      throw new BadRequestException('R2 storage is not configured');
    }

    try {
      const result = await this.storageService.uploadFile(file, 'test-uploads');

      return {
        success: true,
        message: 'File uploaded successfully to R2',
        file: {
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          url: result.url,
          key: result.key,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Upload failed: ${errorMessage}`);
    }
  }

  /**
   * Delete a file from R2
   */
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Body('key') key: string) {
    if (!key) {
      throw new BadRequestException('File key is required');
    }

    if (!this.storageService.isConfigured()) {
      throw new BadRequestException('R2 storage is not configured');
    }

    try {
      await this.storageService.deleteFile(key);

      return {
        success: true,
        message: 'File deleted successfully from R2',
        key,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Delete failed: ${errorMessage}`);
    }
  }

  /**
   * Get a signed URL for a private file
   */
  @Post('signed-url')
  @UseGuards(JwtAuthGuard)
  async getSignedUrl(@Body('key') key: string, @Body('expiresIn') expiresIn?: number) {
    if (!key) {
      throw new BadRequestException('File key is required');
    }

    if (!this.storageService.isConfigured()) {
      throw new BadRequestException('R2 storage is not configured');
    }

    try {
      const url = await this.storageService.getSignedUrl(key, expiresIn || 3600);

      return {
        success: true,
        url,
        expiresIn: expiresIn || 3600,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to generate signed URL: ${errorMessage}`);
    }
  }
}

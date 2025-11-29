import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: AWS.S3;
  private readonly bucketName: string;
  private readonly publicUrl: string;
  private readonly isR2Configured: boolean;

  constructor(private configService: ConfigService) {
    // Check if R2 is configured
    const r2Endpoint = this.configService.get<string>('R2_ENDPOINT');
    const r2AccessKey = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const r2SecretKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');

    this.isR2Configured = !!(r2Endpoint && r2AccessKey && r2SecretKey);

    if (this.isR2Configured) {
      // Configure AWS SDK for Cloudflare R2
      this.s3 = new AWS.S3({
        endpoint: r2Endpoint,
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
        s3ForcePathStyle: true, // Required for R2
        signatureVersion: 'v4',
      });

      this.bucketName = this.configService.get<string>('R2_BUCKET_NAME');
      this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

      this.logger.log(`✅ Cloudflare R2 storage configured (Bucket: ${this.bucketName})`);
    } else {
      this.logger.warn('⚠️  R2 not configured, using local storage fallback');
    }
  }

  /**
   * Upload file to R2
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    if (!this.isR2Configured) {
      throw new Error('R2 storage is not configured');
    }

    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      // Upload to R2
      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read', // Make file publicly accessible
        })
        .promise();

      const url = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : uploadResult.Location;

      this.logger.log(`✅ File uploaded to R2: ${key}`);

      return {
        url,
        key,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error uploading to R2: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.isR2Configured) {
      throw new Error('R2 storage is not configured');
    }

    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();

      this.logger.log(`✅ File deleted from R2: ${key}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error deleting from R2: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isR2Configured) {
      throw new Error('R2 storage is not configured');
    }

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn,
      });

      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error generating signed URL: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Check if R2 is configured and accessible
   */
  async healthCheck(): Promise<{ configured: boolean; accessible?: boolean; error?: string }> {
    if (!this.isR2Configured) {
      return { configured: false };
    }

    try {
      // Try to list bucket contents (this will fail if credentials are wrong)
      await this.s3
        .headBucket({
          Bucket: this.bucketName,
        })
        .promise();

      return { configured: true, accessible: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ R2 health check failed: ${errorMessage}`);
      return {
        configured: true,
        accessible: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if R2 is configured
   */
  isConfigured(): boolean {
    return this.isR2Configured;
  }
}

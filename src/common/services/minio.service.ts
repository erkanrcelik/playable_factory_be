import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const minioConfig = this.configService.get('app.minio');

    this.minioClient = new Minio.Client({
      endPoint: minioConfig.endpoint,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
      region: minioConfig.region,
    });

    this.bucketName = minioConfig.bucket;
    void this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        const region =
          this.configService.get('app.minio.region') || 'us-east-1';
        await this.minioClient.makeBucket(this.bucketName, region);
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize bucket: ${error.message}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    try {
      const timestamp = Date.now();
      const fileName = `${folder}/${timestamp}-${file.originalname}`;

      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        fileName,
        24 * 60 * 60,
      ); // 24 hours

      return {
        url,
        key: fileName,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, key);
      this.logger.log(`File '${key}' deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error('File deletion failed');
    }
  }

  async getFileUrl(
    key: string,
    expiresIn: number = 24 * 60 * 60,
  ): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        key,
        expiresIn,
      );
    } catch (error) {
      this.logger.error(`Failed to get file URL: ${error.message}`);
      throw new Error('Failed to get file URL');
    }
  }

  async listFiles(prefix: string = ''): Promise<string[]> {
    try {
      const stream = this.minioClient.listObjects(
        this.bucketName,
        prefix,
        true,
      );
      const files: string[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (obj.name) {
            files.push(obj.name);
          }
        });
        stream.on('error', reject);
        stream.on('end', () => resolve(files));
      });
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`);
      throw new Error('Failed to list files');
    }
  }
}

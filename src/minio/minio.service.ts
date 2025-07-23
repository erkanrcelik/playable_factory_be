import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectMinio } from './minio.decorator';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';

@Injectable()
export class MinioService {
  constructor(@InjectMinio() private readonly minioService: Minio.Client) {}

  async uploadFile(
    file: Express.Multer.File,
    bucketName: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.createBucket(bucketName)
        .then(() => {
          const allowedExtensions = [
            '.jpeg',
            '.png',
            '.jpg',
            '.webp',
            '.txt',
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
          ];
          const fileName = file.originalname.toLowerCase();
          const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

          if (!allowedExtensions.includes(fileExtension)) {
            return reject(
              new BadRequestException(
                `Invalid file type! Allowed types: JPEG, PNG, WEBP, TXT, PDF, DOC, DOCX, XLS, XLSX`,
              ),
            );
          }

          const filename = `${randomUUID().toString()}-${fileName}`;
          void this.minioService.putObject(
            bucketName,
            filename,
            file.buffer,
            file.size,
            (error: any) => {
              if (error) {
                reject(new Error(`File upload failed: ${error.message}`));
              } else {
                const fileUrl = `https://sekakademi-minio-6de0f3-130-61-48-47.traefik.me/${bucketName}/${filename}`;
                resolve(fileUrl);
              }
            },
          );
        })
        .catch((error) => {
          reject(new Error(`Upload failed: ${error.message}`));
        });
    });
  }

  async bucketsList() {
    return await this.minioService.listBuckets();
  }

  async getFile(filename: string, bucketName: string) {
    return await this.minioService.presignedUrl('GET', bucketName, filename);
  }

  async bucketExists(bucketName: string): Promise<any> {
    return await this.minioService.bucketExists(bucketName);
  }

  async createBucket(bucketName: string): Promise<void> {
    try {
      const exists = await this.bucketExists(bucketName);
      if (!exists) {
        await this.minioService.makeBucket(bucketName, 'us-east-1');
      }
    } catch (error) {
      throw new BadRequestException(`Bucket oluşturulamadı: ${error.message}`);
    }
  }

  async deleteFile(
    bucketName: string,
    filename: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const exists = await this.bucketExists(bucketName);
      if (!exists) {
        throw new NotFoundException(`Bucket "${bucketName}" bulunamadı.`);
      }

      await this.minioService.removeObject(bucketName, filename);
      return { success: true, message: 'Dosya başarıyla silindi.' };
    } catch (error) {
      throw new BadRequestException(
        `Dosya silinirken bir hata oluştu: ${error.message}`,
      );
    }
  }
}

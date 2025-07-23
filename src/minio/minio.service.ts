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
      const allowedExtensions = ['.jpeg', '.png', '.jpg', '.webp'];
      const fileName = file.originalname.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

      if (!allowedExtensions.includes(fileExtension)) {
        return reject(
          new BadRequestException(
            `Geçersiz dosya türü! Yalnızca JPEG, PNG, ve WEBP formatındaki resimler yüklenebilir.`,
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
            reject(new Error(error.message || 'File upload failed'));
          } else {
            const fileUrl = `https://${process.env.MINIO_ENDPOINT}/${bucketName}/${filename}`;
            resolve(fileUrl);
          }
        },
      );
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

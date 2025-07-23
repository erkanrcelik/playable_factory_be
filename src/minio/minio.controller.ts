import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';
import { Express } from 'express';
import {
  ApiTags,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import {
  MinioResponse,
  BucketListResponse,
  FileUrlResponse,
  BucketExistsResponse,
} from './types/minio.types';
import { UploadFileDto, BucketParamDto, FileParamDto } from './dto/minio.dto';

@ApiTags('minio')
@Controller('minio')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload/:bucketName')
  @ApiOperation({
    summary: 'Upload a file to MinIO bucket',
    description:
      'Upload a file to a specified MinIO bucket. The file should be sent as form-data with key "file".',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'bucketName',
    required: true,
    description: 'Name of the bucket to upload to',
    example: 'my-bucket',
  })
  @ApiBody({
    type: UploadFileDto,
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    type: MinioResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or file upload failed',
    type: MinioResponse,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('bucketName') bucketName: string,
  ): Promise<MinioResponse> {
    try {
      const fileUrl = await this.minioService.uploadFile(file, bucketName);
      return { message: 'File uploaded successfully', fileUrl };
    } catch (error) {
      return { message: 'Error uploading file', error: error.message };
    }
  }

  @Get('buckets')
  @ApiOperation({
    summary: 'List all buckets',
    description: 'Retrieve a list of all available MinIO buckets.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of buckets retrieved successfully',
    type: BucketListResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to retrieve buckets',
    type: MinioResponse,
  })
  async getBuckets(): Promise<BucketListResponse | MinioResponse> {
    try {
      const buckets = await this.minioService.bucketsList();
      return { buckets };
    } catch (error) {
      return { message: 'Error retrieving buckets', error };
    }
  }

  @Get('download/:bucketName/:filename')
  @ApiOperation({
    summary: 'Download a file',
    description: 'Get a download URL for a file from a specified bucket.',
  })
  @ApiParam({
    name: 'bucketName',
    description: 'Name of the bucket containing the file',
    example: 'my-bucket',
  })
  @ApiParam({
    name: 'filename',
    description: 'Name of the file to download',
    example: 'example.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'File URL retrieved successfully',
    type: FileUrlResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to retrieve file URL',
    type: MinioResponse,
  })
  async getFile(
    @Param() params: FileParamDto,
  ): Promise<FileUrlResponse | MinioResponse> {
    try {
      const fileUrl = await this.minioService.getFile(
        params.filename,
        params.bucketName,
      );
      return { fileUrl };
    } catch (error) {
      return { message: 'Error downloading file', error };
    }
  }

  @Get('bucket-exists/:bucketName')
  @ApiOperation({
    summary: 'Check if bucket exists',
    description: 'Check if a specified bucket exists in MinIO.',
  })
  @ApiParam({
    name: 'bucketName',
    description: 'Name of the bucket to check',
    example: 'my-bucket',
  })
  @ApiResponse({
    status: 200,
    description: 'Bucket existence checked successfully',
    type: BucketExistsResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to check bucket existence',
    type: MinioResponse,
  })
  async checkBucketExists(
    @Param() params: BucketParamDto,
  ): Promise<BucketExistsResponse | MinioResponse> {
    try {
      const exists = await this.minioService.bucketExists(params.bucketName);
      return { exists };
    } catch (error) {
      return { message: 'Error checking bucket existence', error };
    }
  }

  @Delete('delete/:bucketName/:filename')
  @ApiOperation({
    summary: 'Delete a file from MinIO bucket',
    description: 'Delete a file from a specified MinIO bucket.',
  })
  @ApiParam({
    name: 'bucketName',
    description: 'Name of the bucket containing the file',
    example: 'my-bucket',
  })
  @ApiParam({
    name: 'filename',
    description: 'Name of the file to delete',
    example: 'example.txt',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    type: MinioResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete file',
    type: MinioResponse,
  })
  async deleteFile(
    @Param('bucketName') bucketName: string,
    @Param('filename') filename: string,
  ): Promise<MinioResponse> {
    try {
      const result = await this.minioService.deleteFile(bucketName, filename);
      return { message: result.message };
    } catch (error) {
      return { message: 'Error deleting file', error: error.message };
    }
  }
}

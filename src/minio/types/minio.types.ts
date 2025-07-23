import { ApiProperty } from '@nestjs/swagger';
import { BucketItemFromList } from 'minio';

export class MinioResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'File URL after upload',
    required: false,
    example: 'https://minio-server.com/bucket-name/file-name',
  })
  fileUrl?: string;

  @ApiProperty({
    description: 'Error details if operation fails',
    required: false,
    example: {
      code: 'ERROR_CODE',
      details: 'Error details',
    },
  })
  error?: any;
}

export class BucketListResponse {
  @ApiProperty({
    description: 'List of buckets',
    example: [
      {
        name: 'bucket1',
        creationDate: '2024-03-20T10:00:00.000Z',
      },
      {
        name: 'bucket2',
        creationDate: '2024-03-21T10:00:00.000Z',
      },
    ],
    isArray: true,
  })
  buckets: BucketItemFromList[];
}

export class FileUrlResponse {
  @ApiProperty({
    description: 'URL to access the file',
    example: 'https://minio-server.com/bucket-name/file-name',
  })
  fileUrl: string;
}

export class BucketExistsResponse {
  @ApiProperty({
    description: 'Whether the bucket exists',
    example: true,
  })
  exists: boolean;
}

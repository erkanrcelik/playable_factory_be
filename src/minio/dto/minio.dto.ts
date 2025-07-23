import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload (any format)',
  })
  file: Express.Multer.File;
}

export class BucketParamDto {
  @ApiProperty({
    description: 'Name of the bucket',
    example: 'my-bucket',
  })
  bucketName: string;
}

export class FileParamDto extends BucketParamDto {
  @ApiProperty({
    description: 'Name of the file to download',
    example: 'example.pdf',
  })
  filename: string;
}

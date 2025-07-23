import { SetMetadata, Inject } from '@nestjs/common';

export const MINIO_BUCKET_KEY = 'minio_bucket';
export const MINIO_TOKEN = 'MINIO_INJECT_TOKEN';

export const MinioBucket = (bucket: string) =>
  SetMetadata(MINIO_BUCKET_KEY, bucket);

export function InjectMinio(): ParameterDecorator {
  return Inject(MINIO_TOKEN);
}

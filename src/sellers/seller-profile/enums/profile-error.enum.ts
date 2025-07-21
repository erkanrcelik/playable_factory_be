export enum ProfileError {
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_IMAGE_FORMAT = 'INVALID_IMAGE_FORMAT',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  INVALID_WEBSITE_URL = 'INVALID_WEBSITE_URL',
  STORE_NAME_REQUIRED = 'STORE_NAME_REQUIRED',
  DESCRIPTION_TOO_LONG = 'DESCRIPTION_TOO_LONG',
}

export const ProfileErrorMessages = {
  [ProfileError.PROFILE_NOT_FOUND]: 'Seller profile not found',
  [ProfileError.UNAUTHORIZED_ACCESS]: 'Unauthorized access to this profile',
  [ProfileError.INVALID_IMAGE_FORMAT]:
    'Invalid image format. Only image files are accepted',
  [ProfileError.IMAGE_TOO_LARGE]: 'Image file too large. Maximum 5MB',
  [ProfileError.UPLOAD_FAILED]: 'Image upload failed',
  [ProfileError.INVALID_PHONE_NUMBER]: 'Invalid phone number format',
  [ProfileError.INVALID_WEBSITE_URL]: 'Invalid website URL format',
  [ProfileError.STORE_NAME_REQUIRED]: 'Store name is required',
  [ProfileError.DESCRIPTION_TOO_LONG]:
    'Description cannot exceed 1000 characters',
};

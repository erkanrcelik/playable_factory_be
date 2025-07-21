export enum CampaignError {
  CAMPAIGN_NOT_FOUND = 'CAMPAIGN_NOT_FOUND',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_START_DATE = 'INVALID_START_DATE',
  INVALID_END_DATE = 'INVALID_END_DATE',
  END_DATE_BEFORE_START = 'END_DATE_BEFORE_START',
  INVALID_DISCOUNT_PERCENTAGE = 'INVALID_DISCOUNT_PERCENTAGE',
  INVALID_DISCOUNT_AMOUNT = 'INVALID_DISCOUNT_AMOUNT',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_NOT_OWNED = 'PRODUCT_NOT_OWNED',
  CAMPAIGN_ALREADY_EXISTS = 'CAMPAIGN_ALREADY_EXISTS',
  CAMPAIGN_ACTIVE = 'CAMPAIGN_ACTIVE',
  INVALID_IMAGE_FORMAT = 'INVALID_IMAGE_FORMAT',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

export const CampaignErrorMessages = {
  [CampaignError.CAMPAIGN_NOT_FOUND]: 'Campaign not found',
  [CampaignError.UNAUTHORIZED_ACCESS]: 'Unauthorized access to this campaign',
  [CampaignError.INVALID_START_DATE]: 'Start date must be in the future',
  [CampaignError.INVALID_END_DATE]: 'End date must be after start date',
  [CampaignError.END_DATE_BEFORE_START]: 'End date cannot be before start date',
  [CampaignError.INVALID_DISCOUNT_PERCENTAGE]:
    'Discount percentage must be between 1 and 100',
  [CampaignError.INVALID_DISCOUNT_AMOUNT]:
    'Discount amount must be greater than 0',
  [CampaignError.PRODUCT_NOT_FOUND]: 'Product not found',
  [CampaignError.PRODUCT_NOT_OWNED]:
    'You can only add your own products to campaigns',
  [CampaignError.CAMPAIGN_ALREADY_EXISTS]:
    'Campaign with this name already exists',
  [CampaignError.CAMPAIGN_ACTIVE]: 'Cannot delete active campaign',
  [CampaignError.INVALID_IMAGE_FORMAT]:
    'Invalid image format. Only image files are accepted',
  [CampaignError.IMAGE_TOO_LARGE]: 'Image file too large. Maximum 5MB',
  [CampaignError.UPLOAD_FAILED]: 'Image upload failed',
};

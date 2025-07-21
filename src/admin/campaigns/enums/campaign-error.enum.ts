export enum CampaignError {
  // Campaign errors
  CAMPAIGN_NOT_FOUND = 'CAMPAIGN_NOT_FOUND',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INVALID_DISCOUNT_VALUE = 'INVALID_DISCOUNT_VALUE',
  INVALID_PRODUCTS = 'INVALID_PRODUCTS',
  INVALID_CATEGORIES = 'INVALID_CATEGORIES',
  CAMPAIGN_DELETED_SUCCESS = 'CAMPAIGN_DELETED_SUCCESS',
  CAMPAIGN_CREATED_SUCCESS = 'CAMPAIGN_CREATED_SUCCESS',
  CAMPAIGN_UPDATED_SUCCESS = 'CAMPAIGN_UPDATED_SUCCESS',
}

export const CampaignErrorMessages: Record<CampaignError, string> = {
  [CampaignError.CAMPAIGN_NOT_FOUND]: 'Campaign not found',
  [CampaignError.INVALID_DATE_RANGE]: 'Start date must be before end date',
  [CampaignError.INVALID_DISCOUNT_VALUE]:
    'Percentage discount cannot exceed 100%',
  [CampaignError.INVALID_PRODUCTS]: 'One or more products not found',
  [CampaignError.INVALID_CATEGORIES]: 'One or more categories not found',
  [CampaignError.CAMPAIGN_DELETED_SUCCESS]: 'Campaign deleted successfully',
  [CampaignError.CAMPAIGN_CREATED_SUCCESS]: 'Campaign created successfully',
  [CampaignError.CAMPAIGN_UPDATED_SUCCESS]: 'Campaign updated successfully',
};

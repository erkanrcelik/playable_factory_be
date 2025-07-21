export enum CategoryError {
  // Category creation errors
  CATEGORY_ALREADY_EXISTS = 'CATEGORY_ALREADY_EXISTS',

  // Category not found errors
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',

  // Category deletion errors
  CATEGORY_HAS_PRODUCTS = 'CATEGORY_HAS_PRODUCTS',

  // Success messages
  CATEGORY_CREATED_SUCCESS = 'CATEGORY_CREATED_SUCCESS',
  CATEGORY_UPDATED_SUCCESS = 'CATEGORY_UPDATED_SUCCESS',
  CATEGORY_DELETED_SUCCESS = 'CATEGORY_DELETED_SUCCESS',
  CATEGORY_STATUS_TOGGLED_SUCCESS = 'CATEGORY_STATUS_TOGGLED_SUCCESS',
}

export const CategoryErrorMessages: Record<CategoryError, string> = {
  [CategoryError.CATEGORY_ALREADY_EXISTS]:
    'Category with this name already exists',
  [CategoryError.CATEGORY_NOT_FOUND]: 'Category not found',
  [CategoryError.CATEGORY_HAS_PRODUCTS]:
    'Cannot delete category with associated products',
  [CategoryError.CATEGORY_CREATED_SUCCESS]: 'Category created successfully',
  [CategoryError.CATEGORY_UPDATED_SUCCESS]: 'Category updated successfully',
  [CategoryError.CATEGORY_DELETED_SUCCESS]: 'Category deleted successfully',
  [CategoryError.CATEGORY_STATUS_TOGGLED_SUCCESS]:
    'Category status toggled successfully',
};

export enum AuthError {
  // Registration errors
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',

  // Login errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Token errors
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  INVALID_OR_EXPIRED_VERIFICATION_TOKEN = 'INVALID_OR_EXPIRED_VERIFICATION_TOKEN',
  INVALID_OR_EXPIRED_RESET_TOKEN = 'INVALID_OR_EXPIRED_RESET_TOKEN',

  // Email verification errors
  EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // Success messages
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  EMAIL_VERIFICATION_SUCCESS = 'EMAIL_VERIFICATION_SUCCESS',
  VERIFICATION_EMAIL_SENT = 'VERIFICATION_EMAIL_SENT',
  PASSWORD_RESET_EMAIL_SENT = 'PASSWORD_RESET_EMAIL_SENT',
  LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
}

export const AuthErrorMessages: Record<AuthError, string> = {
  [AuthError.USER_ALREADY_EXISTS]: 'User already exists',
  [AuthError.REGISTRATION_SUCCESS]: 'Registration successful',
  [AuthError.INVALID_CREDENTIALS]: 'Invalid credentials',
  [AuthError.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
  [AuthError.INVALID_REFRESH_TOKEN]: 'Invalid refresh token',
  [AuthError.INVALID_OR_EXPIRED_VERIFICATION_TOKEN]:
    'Invalid or expired verification token',
  [AuthError.INVALID_OR_EXPIRED_RESET_TOKEN]: 'Invalid or expired reset token',
  [AuthError.EMAIL_ALREADY_VERIFIED]: 'Email is already verified',
  [AuthError.USER_NOT_FOUND]: 'User not found',
  [AuthError.PASSWORD_RESET_SUCCESS]: 'Password reset successfully',
  [AuthError.EMAIL_VERIFICATION_SUCCESS]: 'Email verified successfully',
  [AuthError.VERIFICATION_EMAIL_SENT]: 'Verification email sent successfully',
  [AuthError.PASSWORD_RESET_EMAIL_SENT]:
    'If an account with this email exists, a password reset link has been sent',
  [AuthError.LOGOUT_SUCCESS]: 'Logged out successfully',
};

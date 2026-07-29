import crypto from 'crypto';

/**
 * Generate a cryptographically random 6-digit OTP.
 */
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/** OTP validity duration in milliseconds (10 minutes) */
export const OTP_EXPIRY_MS = 10 * 60 * 1000;

/** Minimum gap between OTP resends in milliseconds (60 seconds) */
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

/** Maximum failed OTP verification attempts before requiring resend */
export const MAX_OTP_ATTEMPTS = 5;

/**
 * Minimum password length. Must be enforced in the controller: the User
 * schema's `minlength` runs after the pre-save hook has already replaced the
 * password with its 60-character bcrypt hash, so it never sees the plaintext.
 */
export const MIN_PASSWORD_LENGTH = 6;

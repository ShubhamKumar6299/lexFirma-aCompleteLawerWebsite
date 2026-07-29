import jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  id: string;
}

/**
 * Single source of truth for the signing secret.
 *
 * TODO(security): drop the development fallback and fail fast when JWT_SECRET
 * is unset. Deliberately preserved here so this change stays scoped to the
 * chat layer — tracked as a separate improvement.
 */
const getJwtSecret = (): string => process.env.JWT_SECRET || 'secret';

export const signAccessToken = (userId: string): string =>
  jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

/** Verifies a token, throwing when it is malformed, tampered with, or expired. */
export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, getJwtSecret()) as AccessTokenPayload;

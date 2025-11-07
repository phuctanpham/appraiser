import { sign } from 'hono/jwt'

const ACCESS_TOKEN_EXPIRATION_SECONDS = 12 * 60 * 60; // 12 hours
const REFRESH_TOKEN_EXPIRATION_SECONDS = 12 * 24 * 60 * 60; // 12 days

/**
 * Generates a short-lived access token.
 * @param userId The user's ID.
 * @param secret The JWT secret.
 * @returns A promise that resolves to the signed access token.
 */
export async function generateAccessToken(userId: number, secret: string): Promise<string> {
  const payload = {
    userId: userId,
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRATION_SECONDS,
  }
  return await sign(payload, secret)
}

/**
 * Generates a long-lived refresh token.
 * @param userId The user's ID.
 * @param secret The JWT secret.
 * @returns A promise that resolves to the signed refresh token.
 */
export async function generateRefreshToken(userId: number, secret: string): Promise<string> {
  const payload = {
    userId: userId,
    // Add a claim to differentiate it from an access token, which is good practice
    type: 'refresh',
    exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRATION_SECONDS,
  }
  return await sign(payload, secret)
}

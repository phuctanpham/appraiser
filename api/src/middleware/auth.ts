import { verify } from 'hono/jwt';
import { Context, Next } from 'hono';
import { isTokenExpired } from '../auth/token-validator';

/**
 * A strict authentication middleware.
 * It validates the token and rejects if it is invalid or expired.
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.split(' ')?.[1];

  if (!token) {
    return c.json({ error: 'Unauthorized', message: 'Bearer token not provided' }, 401);
  }

  try {
    const decoded = await verify(token, c.env.JWT_SECRET);

    if (isTokenExpired(decoded)) {
      // Explicitly signal that the token is expired
      return c.json({ error: 'Unauthorized', message: 'Token has expired' }, 401);
    }

    c.set('userId', decoded.userId);

  } catch (error) {
    // Covers all other JWT errors, like an invalid signature
    return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401);
  }

  await next();
};

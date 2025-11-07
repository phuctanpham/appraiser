/**
 * Checks if a decoded JWT token has expired.
 * This is a pure function, its output is solely dependent on its input.
 * 
 * @param decodedToken The decoded JWT payload, which must have an `exp` claim.
 * @returns `true` if the token has expired, `false` otherwise.
 */
export const isTokenExpired = (decodedToken: { exp: number }): boolean => {
  // `exp` is in seconds, Date.now() is in milliseconds
  return decodedToken.exp < Math.floor(Date.now() / 1000);
};

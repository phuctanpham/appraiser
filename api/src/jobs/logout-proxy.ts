import { createPostWarpJob } from './warp-helpers';

/**
 * Job: Proxies a logout/token revocation request to the internal auth service.
 * This is an authenticated route, as the user must present a valid token to revoke it.
 */
export const logoutProxyJob = createPostWarpJob('/auth/revoke');

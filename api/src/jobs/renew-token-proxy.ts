import { createPostWarpJob } from './warp-helpers';

/**
 * Job: Proxies a token renewal request to the internal auth service.
 * The client sends its refresh token, and this job forwards it.
 */
export const renewTokenProxyJob = createPostWarpJob('/auth/renew');

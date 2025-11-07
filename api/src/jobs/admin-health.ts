import { createGetWarpJob } from './warp-helpers';

/**
 * Job: Fetches system-wide health data.
 * This is an admin-level job and reuses the existing GET helper,
 * as the core logic is just to proxy a request.
 */
export const getSystemHealthJob = createGetWarpJob('/system/health');

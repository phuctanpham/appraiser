import { createGetWarpJob } from './warp-helpers';

export const getReportJob = createGetWarpJob('/train/api/reports/:id');

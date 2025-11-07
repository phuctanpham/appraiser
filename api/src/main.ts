import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth';

// Import jobs
import { ocrAnalysisJob } from './jobs/ocr-analysis';
import { predictPriceJob } from './jobs/predict-price';
import { createReportJob } from './jobs/create-report';
import { listReportsJob } from './jobs/list-reports';
import { getReportJob } from './jobs/get-report';
import { getSystemHealthJob } from './jobs/admin-health';
import { renewTokenProxyJob } from './jobs/renew-token-proxy';
import { logoutProxyJob } from './jobs/logout-proxy';

const app = new Hono();

// Middleware
app.use('/*', cors());

// --- Public Routes ---

app.get('/', (c) => c.json({ message: 'API is running' }));
app.get('/health', (c) => c.json({ status: 'ok' }));

// Public endpoint for renewing an access token using a refresh token
app.post('/auth/renew', renewTokenProxyJob);


// --- Authenticated Routes ---

app.use('/api/*', authMiddleware);

// User-facing jobs
app.post('/api/ocr/analysis', ocrAnalysisJob);
app.post('/api/predict', predictPriceJob);
app.post('/api/train/reports', createReportJob);
app.get('/api/train/reports', listReportsJob);
app.get('/api/train/reports/:id', getReportJob);

// Admin-facing jobs
app.get('/api/admin/health', getSystemHealthJob);

// Auth-related jobs
app.post('/api/auth/logout', logoutProxyJob);
app.get('/api/auth/me', (c) => {
  const userId = c.get('userId');
  return c.json({ userId });
});

// --- Error Handling ---

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;

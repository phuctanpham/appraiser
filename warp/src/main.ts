import { Hono } from 'hono';
import { cors } from 'hono/cors';
import ocr from './routes/ocr';

type Bindings = {
  AUTH_API_URL: string;
  OCR_SRV_URL: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS Middleware
app.use('/*', cors({
  origin: '*',
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    service: 'warp',
    timestamp: new Date().toISOString() 
  });
});

// Mount OCR routes
app.route('/api/ocr', ocr);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ 
    error: 'Internal server error',
    message: err.message 
  }, 500);
});

export default app;
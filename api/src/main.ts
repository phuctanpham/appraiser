// api/src/main.ts - Using Hono (Express-like for Cloudflare Workers)
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use('/*', cors());

// Routes
app.get('/', (c) => {
  return c.json({
    message: 'API is running',
    environment: c.env.ENVIRONMENT,
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/users', (c) => {
  return c.json({
    users: [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
    ],
  });
});

app.post('/api/users', async (c) => {
  const body = await c.req.json();
  return c.json({
    message: 'User created',
    data: body,
  }, 201);
});

app.get('/api/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({
    id,
    name: `User ${id}`,
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
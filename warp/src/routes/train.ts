import { Hono } from 'hono';

const train = new Hono();

// POST /api/reports (JSON)
train.post('/api/reports', async (c) => {
  const { _userId, ...body } = await c.req.json();
  
  const res = await fetch(`${c.env.TRAIN_SERVICE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  return c.json(await res.json());
});

// GET /api/reports (with query params)
train.get('/api/reports', async (c) => {
  const url = new URL(c.req.url);
  const res = await fetch(`${c.env.TRAIN_SERVICE_URL}/api/reports${url.search}`);
  return c.json(await res.json());
});

// GET /api/reports/{report_id} (with path param)
train.get('/api/reports/:report_id', async (c) => {
  const report_id = c.req.param('report_id');
  const res = await fetch(`${c.env.TRAIN_SERVICE_URL}/api/reports/${report_id}`);
  return c.json(await res.json());
});

export default train;
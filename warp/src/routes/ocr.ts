import { Hono } from 'hono';

const ocr = new Hono();

ocr.post('/analysis', async (c) => {
  const { _userId, ...body } = await c.req.json();
  
  const res = await fetch(`${c.env.OCR_SERVICE_URL}/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return c.json(await res.json());
});

ocr.get('/health', async (c) => {
  const res = await fetch(`${c.env.OCR_SERVICE_URL}/health`);
  return c.json(await res.json());
});

export default ocr;
import { Hono } from 'hono';

const predict = new Hono();

predict.post('/', async (c) => {
  const { _userId, ...body } = await c.req.json();

  const res = await fetch(`${c.env.PREDICT_SERVICE_URL}` , {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return c.json(await res.json());
});

export default predict;

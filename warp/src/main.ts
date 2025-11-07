import { Hono } from 'hono';
import ocr from './routes/ocr';
import predict from './routes/predict';
import train from './routes/train';

const app = new Hono();

// Internal routes - no auth checks needed here
app.route('/ocr', ocr);
app.route('/predict', predict);
app.route('/train', train);

console.log('Warp service running');

export default app;
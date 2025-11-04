import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { fetchJSON } from '../utils/http';

type Bindings = {
  AUTH_API_URL: string;
  OCR_SRV_URL: string;
  JWT_SECRET: string;
};

const ocr = new Hono<{ Bindings: Bindings }>();

// Health check for OCR service (NO AUTH REQUIRED)
ocr.get('/health', async (c) => {
  try {
    const result = await fetchJSON(`${c.env.OCR_SRV_URL}/health`);
    
    return c.json({
      warp: 'ok',
      ocr: result.ok ? 'ok' : 'error',
      ocrStatus: result.status,
      ocrData: result.data
    });
  } catch (error) {
    return c.json({
      warp: 'ok',
      ocr: 'error',
      error: 'Cannot reach OCR service',
    });
  }
});

// Apply auth middleware ONLY to analyze endpoint
ocr.post('/analyze', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const userId = c.get('userId');
    
    console.log(`User ${userId} requesting OCR analysis`);
    
    // Forward request to OCR Lambda
    const result = await fetchJSON(`${c.env.OCR_SRV_URL}/analyze`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    if (!result.ok) {
      return c.json(result.data, result.status);
    }
    
    return c.json(result.data);
  } catch (error) {
    console.error('OCR analyze error:', error);
    return c.json({ error: 'OCR analysis failed' }, 500);
  }
});

export default ocr;
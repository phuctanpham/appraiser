# Refactor Plan Guide for integrating module of microservices

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                      │
├─────────────────────────────────────────────────────────────┤
│  admin (Main Dashboard)  │  auth (Login/Register GUI)       │
└──────────────┬───────────┴────────────────┬─────────────────┘
               │                            │
               │ ┌──────────────────────────▼─────┐
               │ │   auth (Authentication API)    │
               │ │  - User Management             │
               │ │  - JWT Token Generation        │
               │ │  - Session Management          │
               │ └────────────────────────────────┘
               │
               ▼
        ┌──────────────────┐
        │   api (Gateway)  │ ◄──── All frontend requests
        │  - Request Auth  │       come through here
        │  - Request Log   │
        │  - Rate Limit    │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  warp (Wrapper)  │ ◄──── Internal routing only
        │  - Route to ocr  │       No direct auth checks
        │  - Route to      │
        │    Predict (or   |
        │    Train)        |
        └────┬─────────────┘
             │
             ├─────────────┬─────────────┬
             ▼             ▼             ▼              ▼
        ┌────────┐    ┌─────────┐  ┌─────────┐   
        │  ocr   │    │ predict │  │  train  │   
        │(Python)│    │(Python) │  │(Python) │   
        └────────┘    └─────────┘  └─────────┘   
```

## Migration Phases

### Phase 1: Optical Character Recognition (OCR) Service

#### 1.1 Standardlize I/O for `ocr` service to cover both remaing `train` service and `predcit` service

- Reiew changes of Phase 2, phase 3 and Phase 6 to modify related files. 

- `ocr/src/utils/analysis.py`→ Refer  `predict/src/main.py` to check data fields that ocr service must be collect to input `predict` service (or remaining `train` service). If wrong input, both `predict` service and remaining `train` does not return output. We need single input format for 2 service without changing `predict` service's input format. `orc` and `train` is able to change for expanding data fields to recognize. Let empty to for user input by admin pages if not able to recognize.


### Phase 2: Train Service Migration

#### 2.1: Delete if already migrated Auth Functions to `auth` service
**Files to move**:
- `train/src/auth.py` → Remove if Already handled by `auth` service
- `train/src/auth_routes.py` → Remove if Already handled by `auth` service
- `train/src/auth_middleware.py` → Remove (handled by api layer) if Already handled by `api` service
- `train/src/email_serivce.py` → Remove if Already handled by `auth` service


#### 2.2: Delete if already migrated OCR Functions to `ocr` service, else update to `ocr` service
**Files to move**:
- `train/src/image_analysis_service.py` → `ocr/src/utils/analysis.py` → Remove if Already if Already handled by `ocr` service
- `train/src/parsers.py`: Remove if Already handled by `ocr` service

#### 2.3: Keep Prediction Functions in `train`or
**Keep**:
- `train/src/valuation.py`→ Refactor to Remove unnecessary lines or conflicts because of removing `train/src/auth.py`, `train/src/auth_routes.py`, `train/src/auth_middleware.py`, `train/src/image_analysis_service.py` and `train/src/parsers.py`, Refer `predict` to modify data input for validate 
- `train/src/models.py` → Refactor to Remove lines make conflicts because of removing `train/src/auth.py`, `train/src/auth_routes.py`, `train/src/auth_middleware.py`, `train/src/image_analysis_service.py` and `train/src/parsers.py`
- `train/src/schemas.py` → Refactor to Remove lines make conflicts because of removing `train/src/auth.py`, `train/src/auth_routes.py`, `train/src/auth_middleware.py`, `train/src/image_analysis_service.py` and `train/src/parsers.py`

#### 2.4: Edit (If not existed, Create) `train/src/main.py` 
Refer below sample code block (which may mistake of naming path and files). Note: both External/Internal routing and service-2-service must using http when running on localhost, https when running on production.

- `train/src/main.py` → Refactoring to Remove unnecessary lines or conflicts because of removing `train/src/auth.py`, `train/src/auth_routes.py`, `train/src/auth_middleware.py`, , `train/src/image_analysis_service.py`, `train/src/parsers.py` and changing `train/src/valuation.py`, `train/src/models.py`, `train/src/schemas.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI()

class PredictionRequest(BaseModel):
    property_info: Dict[str, Any]
    condition_assessment: Dict[str, Any]

@app.post("/predict")
async def predict_valuation(request: PredictionRequest):
    """Prediction service endpoint"""
    try:
        # Use valuation logic from train
        from valuation import valuation_heuristic
        
        result = valuation_heuristic(request.property_info)
        
        return {
            "success": True,
            "prediction": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "train"}
```
#### 2.5: Minify `train/src/requirements.txt` 

- `train/src/requirements.txt` → Reduce unnecessary packages because of removing `train/src/auth.py`, `train/src/auth_routes.py`, `train/src/auth_middleware.py`, , `train/src/image_analysis_service.py`, `train/src/parsers.py` and changing `train/src/valuation.py`, `train/src/models.py`, `train/src/schemas.py`

#
### Phase 3: Warp Layer (Internal Router)
**Status**: 🔄 Needs implementation

#### 3.1 Edit (If not existed, Create): `warp/src/routes/ocr.ts`
- Refer below sample code block (which may mistake of naming path and files). Note: both External/Internal routing and service-2-service must using http when running on localhost, https when running on production.

```typescript
import { Hono } from 'hono';

const ocr = new Hono();

ocr.post('/analyze', async (c) => {
  const body = await c.req.json();
  
  // No auth check here - trust api layer
  const res = await fetch(`${c.env.OCR_SERVICE_URL}/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return c.json(await res.json());
});

export default ocr;
```

#### 3.2 Edit (If not existed, Create): `warp/src/routes/train.ts`

- Reiew changes of 'train' service to update

#### 3.3 Edit (If not existed, Create): `warp/src/routes/predict.ts`

- Reiew `predict/src/main.py` to update

#### 3.4 Edit (If not existed, Create): `warp/src/main.ts`
- Refer below sample code block (which may mistake of naming path and files). Note: both External/Internal routing and service-2-service must using http when running on localhost, https when running on production.

```typescript
import { Hono } from 'hono';
import ocr from './routes/ocr';train
import predict from './routes/predict';
import predict from './routes/train';

const app = new Hono();

// Internal routes - no auth
app.route('/ocr', ocr);
app.route('/predict', predict);
app.route('/train', train);

export default app;
```


### Phase 4: API Gateway Layer
**Status**: 🔄 Needs enhancement

#### 4.1 Relationship with `auth` service
Edit (If not existed, Create): `api/src/middleware/auth.ts`
Refer below sample code block (which may mistake of naming path and files). Note: both External/Internal routing and service-2-service must using http when running on localhost, https when running on production.

```typescript
import { verify } from 'hono/jwt';

export const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set('userId', payload.sub);
    c.set('userEmail', payload.email);
    
    // Audit log
    await logRequest(c, payload);
    
    await next();
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

async function logRequest(c, payload) {
  // TODO: Send to centralized logging
  console.log({
    timestamp: new Date().toISOString(),
    userId: payload.sub,
    method: c.req.method,
    path: c.req.path,
    ip: c.req.header('cf-connecting-ip')
  });
}
```

Edit (If not existed, Create): `api/src/main.ts`
- Refer below sample code block (which may mistake of naming path and files). Note: both External/Internal routing and service-2-service must using http when running on localhost, https when running on production.

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth';

const app = new Hono();

app.use('/*', cors());

// Public routes (no auth)
app.get('/health', (c) => c.json({ status: 'ok' }));

// Protected routes (require auth)
app.use('/api/*', authMiddleware);

// Forward to warp
app.post('/api/ocr/analyze', async (c) => {
  const body = await c.req.json();
  const userId = c.get('userId');
  
  const res = await fetch(`${c.env.WARP_URL}/ocr/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, _userId: userId })
  });
  
  return c.json(await res.json());
});

app.post('/api/predict', async (c) => {
  const body = await c.req.json();
  const userId = c.get('userId');
  
  const res = await fetch(`${c.env.WARP_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, _userId: userId })
  });
  
  return c.json(await res.json());
});

export default app;
```

#### 4.2 Relationship with `warp` service

- Reiew changes of 'warp' service to update

#### 4.3 Relationship with `admin` app

- Reiew phase 6 to update


### Phase 5: admin app updates

#### 5.1 Edit (If not existed, Create): `admin/components/dashboard/property-form.tsx`
- Reiew changes of both `train` service and  to update form's fields
- Reiew `predict/src/mail.py` to update form's fields 
- a single form to cover both remaining `train` service and `predict` service
- To manually input form if unable to detect all fields after upload to analysis image.
- Refer below sample code block (which may mistake of naming path and files). Note: both External/Internal routing and service-2-service must using http when running on localhost, https when running on production.
service

```typescript
// Change API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004";

async function analyzeImages() {
  const token = localStorage.getItem("access_token");
  
  // Now call through api gateway
  const response = await fetch(`${API_BASE_URL}/api/ocr/analyze`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ images: images_base64 })
  });
  
  // Handle 401 - redirect to auth
  if (response.status === 401) {
    window.location.href = process.env.AUTH_GUI_URL;
    return;
  }
  
  const result = await response.json();
  // ... rest of code
}
```

#### 5.2 Edit (If not existed, Create): `admin/lib/ab-testing.ts`
Refer below sample code block (which may mistake of naming path and files). Note: both External/Internal routing and service-2-service must using http when running on localhost, https when running on production.

```typescript
export type ModelVersion = 'train' | 'predict';

export function getActiveModel(): ModelVersion {
  if (typeof window === 'undefined') return 'predict';
  return (localStorage.getItem('model_version') as ModelVersion) || 'predict';
}

export function setActiveModel(version: ModelVersion) {
  localStorage.setItem('model_version', version);
}

export async function callPrediction(data: any) {
  const model = getActiveModel();
  const endpoint = model === 'train' 
    ? '/api/train' 
    : '/api/predict';
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
}
```
### Phase 6: Authentication Service (auth)
**Status**: ✅ Already implemented
- [x] User registration/login
- [x] JWT token generation
- [x] D1 database integration

- Review changes of above phase to detect related changed with `auth` to refactor



### Phase 7: E2E Testing Implement

### 1. User flow
* user visit admin page which is built by folder named "admin". If valid access, it will open main page to view dashboard and upload image. If invalid access,  it will return to login pages which is built by  folder named "auth".
* when user is main page,  user to use optical context recognition's feature by uploading an image to analysis then generate contents, which is within image,  is to input a data form.  The optical context recognition's service is  is built by folder named "orc"
* User is able to edit data form if wrong recognition.
* after data form is submitted , charts and insights are generated automatically on Admin page.
B) Technical Requirments
* Each transaction, is for both request and response,  communicate between app and api. It must be authenticated, authorized and audited by auth.
* Each transaction, is for both request and response,  communicate between api and warp. It must not be authenticated, authorized and audited by auth.
* Each transaction, is for both request and response,  communicate between warp and orc. It must not be authenticated, authorized and audited by auth.
* Each transaction, is for both request and response,  communicate between warp and predict. It must not be authenticated, authorized and audited by auth.
* Each transaction, is for both request and response,  communicate between warp and train. It must not rcbe authenticated, authorized and audited by auth.
* train, ocr, and predict are not able to communicate with each other, api, and app, They must communicate with warp only. 
* Admin page is to have display both result of `train` and `predict` 


### 2. E2E Tests
Edit (If not existed, Create): `test/e2e/user-flow.test.ts`:
Refer below sample code block (which may mistake of naming path and files). Note: both External/Internal routing and service-2-service must using http when running on localhost, https when running on production.

```typescript
describe('User Flow E2E', () => {
  test('Complete property valuation flow', async () => {
    // 1. Login
    const loginRes = await fetch(`${AUTH_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
    });
    const { token } = await loginRes.json();
    
    // 2. Upload image for OCR
    const ocrRes = await fetch(`${API_URL}/api/ocr/analyze`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ images: [mockImage] })
    });
    const ocrData = await ocrRes.json();
    
    // 3. Get prediction
    const predRes = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(ocrData.data)
    });
    const prediction = await predRes.json();
    
    expect(prediction.success).toBe(true);
  });
});
```

## Deployment Checklist

- [ ] Deploy train service
- [ ] Deploy predict service
- [ ] Deploy ocr service
- [ ] Deploy warp service
- [ ] Deploy auth service
- [ ] Deploy api gateway
- [ ] Update admin frontend env vars
- [ ] Run E2E tests
- [ ] Monitor logs for errors

## Service Communication Matrix

| From → To | Auth Required | Audit Logged | Notes |
|-----------|--------------|--------------|-------|
| admin → api | ✅ Yes | ✅ Yes | All frontend requests |
| api → warp | ❌ No | ❌ No | Internal routing |
| warp → ocr | ❌ No | ❌ No | Service to service |
| warp → predict | ❌ No | ❌ No | Service to service |
| warp → train | ❌ No | ❌ No | Service to service |
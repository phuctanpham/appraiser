import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import httpx

# Load .env file
load_dotenv()

# Get environment variables
OCR_SRV_URL = os.getenv('OCR_SRV_URL')
WARP_API_URL = os.getenv('WARP_API_URL')
AUTH_API_URL = os.getenv('AUTH_API_URL')

if not all([OCR_SRV_URL, WARP_API_URL, AUTH_API_URL]):
    raise ValueError("One or more environment variables are not set")

app = FastAPI()

@app.post("/analysis")
async def analysis(request: Request):
    """
    Analyze an image by proxying the request to the OCR service.
    """
    # Get authorization header
    authorization = request.headers.get("Authorization")

    # Check for API key
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized - No token provided")

    # Validate API key
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": authorization}
            response = await client.get(f"{AUTH_API_URL}/users/validate", headers=headers)
            response.raise_for_status()  # Raise an exception for non-2xx status codes
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"API key validation failed: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error during API key validation: {str(e)}")

    # Get JSON data from the request
    try:
        data = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON payload: {str(e)}")

    # Proxy to OCR service
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{OCR_SRV_URL}/analysis", json=data)
            res.raise_for_status()  # Raise an exception for non-2xx status codes
            return JSONResponse(content=res.json(), status_code=res.status_code)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"OCR service request failed: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error during OCR request: {str(e)}")

@app.get("/health")
async def health_check():
    """
    Health check endpoint for the warp service.
    """
    # Check OCR service health
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OCR_SRV_URL}/health")
            ocr_status = response.json()
    except Exception as e:
        ocr_status = {"status": "error", "detail": str(e)}

    return {
        "warp": "ok",
        "ocr": "ok" if ocr_status.get("status") == "ok" else "error",
        "ocrStatus": ocr_status.get("status_code", 500),
        "ocrData": ocr_status,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8788)
import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .models import PropertyReport, PropertyImage, get_db
from .schemas import PropertyReportCreate

import logging
logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

logger.info("Training server starting...")
app = FastAPI(title="AI Asset Valuation API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3002", 
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/reports")
async def create_report(
    payload: PropertyReportCreate,
    db: Session = Depends(get_db)
):
    """Create new property report"""
    try:
        report = PropertyReport(
            address=payload.address,
            category=payload.category,
            land_area=payload.land_area,
            size=payload.size,
            bedrooms=payload.bedrooms,
            bathrooms=payload.bathrooms,
            floors=payload.floors,
            direction=payload.direction,
            legal_status=payload.legal_status,
            furniture=payload.furniture,
            width=payload.width,
            length=payload.length,
            overall_condition=payload.overall_condition,
            cleanliness=payload.cleanliness,
            maintenance_status=payload.maintenance_status,
            major_issues=payload.major_issues,
            overall_description=payload.overall_description,
            ai_analysis_raw=payload.ai_analysis_raw
        )
        
        # Add images
        if payload.images:
            for img_data in payload.images:
                if isinstance(img_data, dict):
                    filename = img_data.get('filename', '')
                    url = img_data.get('url', '')
                    key = img_data.get('key', '')
                else:
                    filename = img_data.filename if hasattr(img_data, 'filename') else ''
                    url = img_data.url if hasattr(img_data, 'url') else ''
                    key = img_data.key if hasattr(img_data, 'key') else ''
                
                property_image = PropertyImage(
                    report=report,
                    s3_url=url,
                    s3_key=key,
                    original_filename=filename
                )
                db.add(property_image)
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return {
            "success": True,
            "report_id": report.id,
            "created_at": report.created_at
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Create report error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/reports")
async def list_reports(
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """List all property reports"""
    try:
        reports = db.query(PropertyReport).order_by(PropertyReport.created_at.desc()).offset(offset).limit(limit).all()
        
        return {
            "success": True,
            "reports": [
                {
                    "id": r.id,
                    "address": r.address,
                    "category": r.category,
                    "created_at": r.created_at,
                    "overall_condition": r.overall_condition,
                    "images_count": len(r.images)
                }
                for r in reports
            ]
        }
    except Exception as e:
        logger.error(f"List reports error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/reports/{report_id}")
async def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed report"""
    report = db.query(PropertyReport).filter(PropertyReport.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "success": True,
        "report": {
            "id": report.id,
            "address": report.address,
            "category": report.category,
            "land_area": report.land_area,
            "size": report.size,
            "bedrooms": report.bedrooms,
            "bathrooms": report.bathrooms,
            "floors": report.floors,
            "direction": report.direction,
            "legal_status": report.legal_status,
            "furniture": report.furniture,
            "width": report.width,
            "length": report.length,
            "overall_condition": report.overall_condition,
            "cleanliness": report.cleanliness,
            "maintenance_status": report.maintenance_status,
            "major_issues": report.major_issues,
            "overall_description": report.overall_description,
            "images": [
                {
                    "id": img.id,
                    "url": img.s3_url,
                    "filename": img.original_filename,
                    "uploaded_at": img.uploaded_at
                }
                for img in report.images
            ],
            "created_at": report.created_at,
            "updated_at": report.updated_at
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

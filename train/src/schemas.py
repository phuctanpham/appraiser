from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class PropertyReportCreate(BaseModel):
    # Basic info
    address: str
    category: str
    land_area: Optional[float] = None
    size: float
    bedrooms: int
    bathrooms: int
    floors: int
    direction: str
    legal_status: str
    furniture: str
    width: Optional[float] = None
    length: Optional[float] = None
    
    # Condition assessment
    overall_condition: str
    cleanliness: str
    maintenance_status: str
    major_issues: Optional[List[str]] = None
    overall_description: str
    
    # Images and AI analysis
    images: List[Dict[str, str]]
    ai_analysis_raw: Optional[Dict[str, Any]] = None


class PropertyReportResponse(BaseModel):
    id: int
    address: str
    category: str
    land_area: Optional[float]
    size: float
    bedrooms: int
    bathrooms: int
    floors: int
    direction: str
    legal_status: str
    furniture: str
    overall_condition: str
    cleanliness: str
    maintenance_status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

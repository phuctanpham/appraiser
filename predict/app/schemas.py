# app/schemas.py

from pydantic import BaseModel, Field
from typing import Optional

# Schema cho dữ liệu đầu vào, phản ánh đúng các features cần thiết
class RealEstateFeatures(BaseModel):
    # Numerical features
    size: float = Field(..., description="Diện tích đất (m2)")
    longitude: float = Field(..., description="Kinh độ (Longitude)")
    latitude: float = Field(..., description="Vĩ độ (Latitude)")
    living_size: Optional[float] = Field(None, description="Diện tích sử dụng (m2)")
    width: Optional[float] = Field(None, description="Chiều rộng (m)")
    length: Optional[float] = Field(None, description="Chiều dài (m)")
    rooms: Optional[float] = Field(None, description="Số phòng") # Dùng float vì dữ liệu gốc là float
    toilets: Optional[float] = Field(None, description="Số toilet")
    floors: Optional[float] = Field(None, description="Số tầng")

    # Categorical features
    category: str = Field(..., description="Loại hình bất động sản (VD: 'Nhà riêng')")
    region: str = Field(..., description="Tỉnh/Thành phố (VD: 'Hà Nội')")
    area: str = Field(..., description="Quận/Huyện (VD: 'Quận Đống Đa')")

    class Config:
        schema_extra = {
            "example": {
                "size": 85.5,
                "longitude": 105.80,
                "latitude": 21.01,
                "living_size": 250.0,
                "width": 5.0,
                "length": 17.1,
                "rooms": 4,
                "toilets": 3,
                "floors": 3,
                "category": "Nhà riêng",
                "region": "Hà Nội",
                "area": "Quận Ba Đình"
            }
        }

# Schema cho kết quả trả về
class PredictionResponse(BaseModel):
    estimated_price_vnd: float = Field(..., description="Giá trị ước tính của tài sản (đơn vị: VND)")
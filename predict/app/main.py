# app/main.py

import joblib
import lightgbm as lgb
import pandas as pd
from fastapi import FastAPI, HTTPException
from . import schemas

# --- KHỞI TẠO ỨNG DỤNG VÀ LOAD MODEL ---

# Mô tả cho API docs
API_DESCRIPTION = """
API Ước tính Giá trị Bất động sản 🏡
Sử dụng mô hình LightGBM để dự đoán giá nhà dựa trên các đặc điểm đầu vào.
"""

app = FastAPI(
    title="Real Estate Price Prediction API",
    description=API_DESCRIPTION,
    version="1.1.0"
)

# Đường dẫn tới các file model artifacts
PREPROCESSOR_PATH = "model_artifacts/preprocessor.pkl"
MODEL_PATH = "model_artifacts/lightgbm_model.txt"

# Load preprocessor và model khi ứng dụng khởi động
# Đây là best practice để tránh load lại model mỗi lần có request
try:
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    print("✅ Pipeline tiền xử lý đã được load thành công.")
    
    model = lgb.Booster(model_file=MODEL_PATH)
    print("✅ Mô hình LightGBM đã được load thành công.")
except FileNotFoundError as e:
    print(f"❌ LỖI: Không tìm thấy file model hoặc preprocessor. Chi tiết: {e}")
    preprocessor = None
    model = None

# --- ĐỊNH NGHĨA CÁC ENDPOINTS ---

@app.get("/", tags=["General"])
def read_root():
    """Endpoint gốc để kiểm tra trạng thái của API."""
    return {"status": "OK", "message": "Chào mừng đến với API Ước tính Giá trị Bất động sản!"}

@app.post("/predict", 
          response_model=schemas.PredictionResponse, 
          tags=["Prediction"],
          summary="Dự đoán giá bất động sản")
def predict_price(features: schemas.RealEstateFeatures):
    """
    Nhận các đặc điểm của bất động sản và trả về giá trị ước tính.
    
    Các trường có thể để trống (gửi `null`): `living_size`, `width`, `length`, `rooms`, `toilets`, `floors`.
    """
    if not preprocessor or not model:
        raise HTTPException(status_code=503, detail="Model hoặc Preprocessor không sẵn sàng. Vui lòng liên hệ quản trị viên.")

    # 1. Chuyển dữ liệu đầu vào (Pydantic model) thành a pandas DataFrame
    # Cấu trúc DataFrame phải khớp với cấu trúc được dùng để train preprocessor
    feature_order = [
        'size', 'living_size', 'width', 'length', 'rooms', 'toilets', 'floors', 
        'longitude', 'latitude', 'category', 'region', 'area'
    ]
    input_dict = features.dict()
    input_df = pd.DataFrame([input_dict])[feature_order]

    print("\n--- Dữ liệu đầu vào nhận được ---")
    print(input_df.to_markdown(index=False))

    # 2. Áp dụng pipeline tiền xử lý
    try:
        transformed_features = preprocessor.transform(input_df)
        print("\n--- Dữ liệu sau khi qua pipeline tiền xử lý ---")
        print(transformed_features)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi khi tiền xử lý dữ liệu: {e}")

    # 3. Thực hiện dự đoán với model LightGBM
    prediction = model.predict(transformed_features)

    # Lấy kết quả đầu tiên (vì chúng ta chỉ dự đoán cho 1 mẫu)
    estimated_price = prediction[0]
    
    print(f"\n--- Kết quả dự đoán (VND) --- \n{estimated_price:,.0f} VND")

    return {"estimated_price_vnd": estimated_price}
nul not found
# 🏡 API Ước tính Giá trị Bất động sản

![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.85%2B-green.svg)
![LightGBM](https://img.shields.io/badge/Model-LightGBM-purple.svg)
![ChợTốt](https://gateway.chotot.com/v1/public/ad-listing-video?cg=1020&region_v2=13000&st=s%2Ck&source=listing&limit=80&page=1&key_param_included=true&video_count_included=true)

Dự án này triển khai một API hiệu suất cao sử dụng FastAPI để phục vụ mô hình Machine Learning (LightGBM) nhằm ước tính giá trị bất động sản dựa trên các đặc điểm đầu vào.

## ✨ Tính năng chính

- **Dự đoán nhanh:** Sử dụng LightGBM và kiến trúc bất đồng bộ của FastAPI để cho kết quả gần như tức thì.
- **Xử lý dữ liệu phức tạp:** Tích hợp pipeline tiền xử lý của Scikit-learn để xử lý các giá trị thiếu (missing values) và chuyển đổi dữ liệu categorical.
- **Tài liệu API tự động:** Giao diện Swagger UI (`/docs`) và ReDoc (`/redoc`) được tạo tự động để dễ dàng kiểm tra và tích hợp.
- **Xác thực dữ liệu:** Sử dụng Pydantic để đảm bảo dữ liệu đầu vào luôn đúng định dạng.
- **Sẵn sàng cho Production:** Cấu trúc dự án rõ ràng, dễ dàng đóng gói bằng Docker và triển khai.

## 📂 Cấu trúc Dự án

```
/real_estate_api
|
|-- /app
|   |-- __init__.py
|   |-- main.py           # Logic chính của FastAPI, endpoint
|   |-- schemas.py        # Pydantic models (cấu trúc dữ liệu I/O)
|
|-- /model_artifacts
|   |-- lightgbm_model.txt  # File model LightGBM đã huấn luyện
|   |-- preprocessor.pkl    # File pipeline tiền xử lý (joblib)
|
|-- requirements.txt      # Danh sách các thư viện Python cần thiết
|-- README.md             # File tài liệu này
```

## 🚀 Hướng dẫn Cài đặt và Chạy

### 1. Yêu cầu
- Python 3.9+
- `pip` và `venv`

### 2. Các bước cài đặt

**a. Clone repository (Nếu bạn dùng Git)**
```bash
git clone <your-repo-url>
cd predict
```

**b. Tạo và kích hoạt môi trường ảo**
```bash
# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường
# Trên Windows:
venv\Scripts\activate
# Trên macOS/Linux:
source venv/bin/activate
```

**c. Cài đặt các thư viện cần thiết**
```bash
pip install -r requirements.txt
```

**d. Đặt các file Model Artifacts**

> **QUAN TRỌNG:** Sao chép các file model đã huấn luyện của bạn vào thư mục `model_artifacts/`:
>
> - `lightgbm_model.txt`
> - `preprocessor.pkl`

### 3. Khởi chạy Server
Sử dụng `uvicorn` để khởi chạy ứng dụng:
```bash
uvicorn app.main:app --reload
```

```
 docker compose up --build
```
- `--reload`: Server sẽ tự động khởi động lại mỗi khi có thay đổi trong mã nguồn.

Server sẽ chạy tại địa chỉ `http://127.0.0.1:8000`.

## 🛠️ Cách sử dụng API

Sau khi khởi chạy server, bạn có thể tương tác với API theo các cách sau:

### 1. Giao diện Swagger UI (Khuyến khích)
Mở trình duyệt và truy cập: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

Tại đây bạn có thể xem chi tiết các endpoint, thử gửi request và xem kết quả trả về một cách trực quan.

### 2. Sử dụng `curl`
Bạn có thể gửi một yêu cầu `POST` tới endpoint `/predict` từ terminal:

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/predict' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
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
}'
```

**Kết quả trả về thành công (ví dụ):**
```json
{
  "estimated_price_vnd": 5875000000.0
}
```

## 💻 Công nghệ sử dụng
- **Backend Framework:** FastAPI
- **ML Model:** LightGBM
- **ML Pipeline:** Scikit-learn, Pandas
- **Data Validation:** Pydantic
- **ASGI Server:** Uvicorn
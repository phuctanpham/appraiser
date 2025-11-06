# Dockerfile (Cập nhật)

# BƯỚC 1: Chọn một base image Python ổn định
FROM python:3.10-slim

# =========================================================================
# BƯỚC 1.5 (THÊM MỚI): Cài đặt các thư viện hệ thống cần thiết
# Cập nhật danh sách gói và cài đặt libgomp1, thư viện mà LightGBM cần
# Cleanup sau khi cài để giữ cho image nhỏ gọn
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgomp1 && \
    rm -rf /var/lib/apt/lists/*
# =========================================================================

# BƯỚC 2: Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# BƯỚC 3: Sao chép file requirements và cài đặt thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# BƯỚC 4: Sao chép toàn bộ mã nguồn của dự án vào container
COPY ./app /app/app
COPY ./model_artifacts /app/model_artifacts

# BƯỚC 5: Thiết lập command mặc định để khởi chạy server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
# trainer.Dockerfile - Tối ưu cho việc chạy script training

# Sử dụng cùng một base image với API để đảm bảo tính nhất quán
FROM python:3.10-slim

# Cài đặt các thư viện hệ thống cần thiết (ví dụ: libgomp1 cho LightGBM)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgomp1 && \
    rm -rf /var/lib/apt/lists/*

# Thiết lập thư mục làm việc bên trong container
WORKDIR /trainer_app

# --- Các lệnh COPY sau đây đều lấy file từ "build context" (thư mục gốc dự án) ---

# 1. Copy file requirements để cài đặt môi trường
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. Copy script training vào thư mục làm việc
# Docker sẽ tìm file tại: ./model_artifacts/train_model.py
COPY ./model_artifacts/train_model.py .

# 3. Copy dữ liệu training vào thư mục làm việc
# Docker sẽ tìm file tại: ./chotot_bds_video_data.csv
COPY ./chotot_bds_video_data.csv .

# CMD mặc định là chạy script training
CMD ["python", "train_model.py"]
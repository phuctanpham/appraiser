# Dockerfile (Cập nhật)

FROM python:3.10-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends libgomp1 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src/main.py /app/main.py
COPY ./src/schemas.py /app/schemas.py
COPY ./src/__init__.py /app/__init__.py
COPY ./model_artifacts /app/model_artifacts

ENV MODEL_PATH=/app/model_artifacts/lightgbm_model.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
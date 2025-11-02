# model_artifacts/train_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import lightgbm as lgb
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import warnings
import sys
import json
from datetime import datetime
import logging
import os

# --- Thiết lập logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Định nghĩa đường dẫn ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE_PATH = os.path.join(BASE_DIR, './chotot_bds_video_data.csv') # Dữ liệu ở thư mục gốc
PREPROCESSOR_PATH = os.path.join(BASE_DIR, 'preprocessor.pkl')
MODEL_PATH = os.path.join(BASE_DIR, 'lightgbm_model.txt')
METADATA_PATH = os.path.join(BASE_DIR, 'metadata.json')
STATUS_PATH = os.path.join(BASE_DIR, 'training_status.json') # File ghi lại trạng thái

def log_status(status, message, metrics=None):
    """Ghi lại trạng thái cuối cùng của quá trình training."""
    status_data = {
        "status": status,
        "message": message,
        "timestamp_utc": datetime.utcnow().isoformat(),
        "metrics": metrics or {}
    }
    with open(STATUS_PATH, 'w', encoding='utf-8') as f:
        json.dump(status_data, f, ensure_ascii=False, indent=4)
    logging.info(f"Trạng thái training đã được ghi: {status}")

def train_and_save_model():
    """Hàm chính để thực hiện toàn bộ quy trình training."""
    try:
        # ==============================================================================
        # BƯỚC 1: TẢI DỮ LIỆU
        # ==============================================================================
        logging.info("--- BƯỚC 1: TẢI DỮ LIỆU TỪ FILE CSV ---")
        if not os.path.exists(DATA_FILE_PATH):
            raise FileNotFoundError(f"Không tìm thấy file dữ liệu tại '{DATA_FILE_PATH}'")
        
        df = pd.read_csv(DATA_FILE_PATH)
        logging.info(f"✅ Tải thành công dữ liệu. Tổng cộng có {len(df)} dòng.")

        # ==============================================================================
        # BƯỚC 2: TIỀN XỬ LÝ VÀ XÂY DỰNG PIPELINE
        # ==============================================================================
        logging.info("\n--- BƯỚC 2: TIỀN XỬ LÝ VÀ XÂY DỰNG PIPELINE ---")
        if df['price'].dtype == 'object':
            df['price'] = pd.to_numeric(df['price'], errors='coerce')
        df.dropna(subset=['price'], inplace=True)

        y = df['price']
        numerical_features = ['size', 'living_size', 'width', 'length', 'rooms', 'toilets', 'floors', 'longitude', 'latitude']
        categorical_features = ['category', 'region', 'area']
        X = df[numerical_features + categorical_features].copy()

        numerical_transformer = Pipeline(steps=[('imputer', SimpleImputer(strategy='median'))])
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('encoder', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1))
        ])
        preprocessor = ColumnTransformer(transformers=[
            ('num', numerical_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ])
        logging.info("✅ Pipeline tiền xử lý đã được định nghĩa.")

        # ==============================================================================
        # BƯỚC 3 & 4: CHIA DỮ LIỆU VÀ HUẤN LUYỆN MODEL
        # ==============================================================================
        logging.info("\n--- BƯỚC 3 & 4: CHIA DỮ LIỆU VÀ HUẤN LUYỆN MODEL ---")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_train_processed = preprocessor.fit_transform(X_train)
        X_test_processed = preprocessor.transform(X_test)

        params = {'objective': 'regression_l1', 'metric': 'mae', 'n_estimators': 2000, 'learning_rate': 0.01,
                  'feature_fraction': 0.8, 'bagging_fraction': 0.8, 'bagging_freq': 1, 'lambda_l1': 0.1,
                  'lambda_l2': 0.1, 'num_leaves': 31, 'verbose': -1, 'n_jobs': -1, 'seed': 42}
        
        logging.info("Bắt đầu huấn luyện LightGBM...")
        lgbm_model = lgb.LGBMRegressor(**params)
        lgbm_model.fit(X_train_processed, y_train, eval_set=[(X_test_processed, y_test)],
                       eval_metric='mae', callbacks=[lgb.early_stopping(100, verbose=True)])
        logging.info("✅ Huấn luyện hoàn tất!")

        # ==============================================================================
        # BƯỚC 5: ĐÁNH GIÁ VÀ LƯU KẾT QUẢ
        # ==============================================================================
        logging.info("\n--- BƯỚC 5: ĐÁNH GIÁ VÀ LƯU KẾT QUẢ ---")
        y_pred = lgbm_model.predict(X_test_processed)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        metrics = {"mean_absolute_error": mae, "r2_score": r2}
        logging.info(f"Mean Absolute Error (MAE): {mae:,.0f} VND")
        logging.info(f"R-squared (R2) score: {r2:.4f}")

        joblib.dump(preprocessor, PREPROCESSOR_PATH)
        logging.info(f"✅ Preprocessor đã được lưu tại: {PREPROCESSOR_PATH}")
        lgbm_model.booster_.save_model(MODEL_PATH)
        logging.info(f"✅ Model đã được lưu tại: {MODEL_PATH}")

        metadata = {"model_version": "1.1.0", "training_data_shape": str(X_train.shape), "performance_metrics": metrics}
        with open(METADATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=4)
        logging.info(f"✅ Metadata đã được lưu tại: {METADATA_PATH}")

        # Ghi lại trạng thái thành công
        log_status("SUCCESS", "Quy trình huấn luyện và lưu model hoàn tất.", metrics)

    except Exception as e:
        # Ghi lại lỗi và trạng thái thất bại
        logging.error(f"❌ QUÁ TRÌNH TRAINING THẤT BẠI: {e}", exc_info=True)
        log_status("FAILED", str(e))
        sys.exit(1) # Thoát với mã lỗi

if __name__ == '__main__':
    train_and_save_model()
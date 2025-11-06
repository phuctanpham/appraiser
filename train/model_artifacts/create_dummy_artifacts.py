# model_artifacts/create_dummy_artifacts.py
import pandas as pd
import lightgbm as lgb
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OrdinalEncoder
from sklearn.compose import ColumnTransformer
import joblib

print("--- Bắt đầu tạo các model artifacts giả lập để test API ---")

# --- 1. Tạo dữ liệu giả cực nhỏ ---
dummy_data = {
    'size': [100.0],
    'living_size': [80.0],
    'width': [5.0],
    'length': [20.0],
    'rooms': [3.0],
    'toilets': [2.0],
    'floors': [2.0],
    'longitude': [105.8],
    'latitude': [21.0],
    'category': ['Nhà riêng'],
    'region': ['Hà Nội'],
    'area': ['Quận Ba Đình'],
    'price': [5000000000] # 5 tỷ
}
df_dummy = pd.DataFrame(dummy_data)

X = df_dummy.drop('price', axis=1)
y = df_dummy['price']

# --- 2. Tạo Preprocessor giả ---
# Cấu trúc phải y hệt như trong script training thật
numerical_features = ['size', 'living_size', 'width', 'length', 'rooms', 'toilets', 'floors', 'longitude', 'latitude']
categorical_features = ['category', 'region', 'area']

numerical_transformer = Pipeline(steps=[('imputer', SimpleImputer(strategy='median'))])
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_features),
        ('cat', categorical_transformer, categorical_features)
    ],
    remainder='passthrough'
)

# Fit preprocessor với dữ liệu giả
preprocessor.fit(X)

# Lưu preprocessor
PREPROCESSOR_PATH = 'preprocessor.pkl'
joblib.dump(preprocessor, PREPROCESSOR_PATH)
print(f"✅ Đã tạo và lưu preprocessor giả tại: {PREPROCESSOR_PATH}")


# --- 3. Tạo Model LightGBM giả ---
# Áp dụng preprocessor để có dữ liệu cho training
X_processed = preprocessor.transform(X)

# Tạo và train một model cực kỳ đơn giản
params = { 'objective': 'regression', 'metric': 'l1', 'verbose': -1 }
dummy_model = lgb.train(
    params,
    lgb.Dataset(X_processed, label=y),
    num_boost_round=1 # Chỉ train 1 vòng lặp là đủ
)

# Lưu model
MODEL_PATH = 'lightgbm_model.txt'
dummy_model.save_model(MODEL_PATH)
print(f"✅ Đã tạo và lưu model LightGBM giả tại: {MODEL_PATH}")

print("\n🎉 Hoàn thành! Giờ bạn có thể khởi chạy server FastAPI để test.")
#!/bin/bash
SERVICE=$1  # warp or predict
cd $SERVICE

rm -rf layer
mkdir -p layer/python

if [ -f "requirements-layer.txt" ]; then
  pip install -r requirements-layer.txt -t layer/python --platform manylinux2014_x86_64 --only-binary=:all:
else
  pip install -r requirements.txt -t layer/python --platform manylinux2014_x86_64 --only-binary=:all:
fi

cd layer
zip -r9 ../layer.zip .
cd ..

aws lambda publish-layer-version \
  --layer-name "${SERVICE}-deps" \
  --zip-file fileb://layer.zip \
  --compatible-runtimes python3.11
FROM python:3.10-slim

# Install system dependencies for OCR & PDFs
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project
COPY . .

# Ensure runtime folders exist
RUN mkdir -p uploads outputs

# Cloud Run uses port 8080
EXPOSE 8080

# Run using Gunicorn (production)
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]

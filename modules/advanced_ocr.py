# ==================== modules/advanced_ocr.py (COMPLETE WITH DATADOG) ====================

import pytesseract
from PIL import Image
import cv2
import numpy as np
import pdf2image
import os
from datetime import datetime

# 🎯 DATADOG METRICS
from modules.datadog_client import gauge


class AdvancedOCRProcessor:
    """Advanced OCR for image-based PDFs and images with Datadog observability"""

    def __init__(self):
        # Configure Tesseract path if needed (Windows safe)
        try:
            possible_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            ]

            for path in possible_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.tesseract_cmd = path
                    print(f"✅ Tesseract found at: {path}")
                    break
        except Exception:
            print("⚠️ Tesseract not configured, using fallback")

    def extract_from_image_based_pdf(self, pdf_path, dpi=300):
        """Extract text from image-based PDFs with Datadog metrics"""
        print(f"🔍 Processing image-based PDF: {pdf_path}")

        text_results = []
        page_confidences = []

        try:
            # Convert PDF to images
            images = pdf2image.convert_from_path(pdf_path, dpi=dpi)
            print(f"  Converted to {len(images)} images")

            for page_num, image in enumerate(images, 1):
                img_np = np.array(image)

                # Preprocess image
                processed_img = self._preprocess_image(img_np)

                # OCR with confidence data
                ocr_data = pytesseract.image_to_data(
                    processed_img,
                    output_type=pytesseract.Output.DICT,
                    config='--psm 6 --oem 3'
                )

                n_boxes = len(ocr_data['text'])
                valid_confidences = []

                for i in range(n_boxes):
                    text = ocr_data['text'][i].strip()
                    conf = int(ocr_data['conf'][i])

                    if text and conf > 30:
                        confidence = conf / 100.0
                        valid_confidences.append(confidence)

                        text_results.append({
                            'page': page_num,
                            'line': ocr_data['line_num'][i],
                            'text': text,
                            'type': 'ocr',
                            'confidence': confidence,
                            'position': {
                                'left': ocr_data['left'][i],
                                'top': ocr_data['top'][i],
                                'width': ocr_data['width'][i],
                                'height': ocr_data['height'][i]
                            }
                        })

                # 🎯 DATADOG METRIC: Per-page OCR confidence (MANDATORY)
                if valid_confidences:
                    avg_confidence = sum(valid_confidences) / len(valid_confidences)
                    
                    gauge("govdoc.ocr.confidence", avg_confidence, 
                          tags=[f"page:{page_num}", "source:tesseract"])
                    
                    page_confidences.append(avg_confidence)
                    
                    print(f"    Page {page_num}: "
                          f"{len(valid_confidences)} elements, "
                          f"avg OCR confidence={round(avg_confidence, 2)}")

            # 🎯 DATADOG METRIC: Document-level OCR confidence (MANDATORY)
            if page_confidences:
                doc_confidence = sum(page_confidences) / len(page_confidences)
                
                gauge("govdoc.ocr.document_confidence", doc_confidence,
                      tags=["document_type:pdf", "ocr_engine:tesseract"])
                
                print(f"✅ Total extracted text elements: {len(text_results)}")
                print(f"📊 Document OCR Quality: {doc_confidence:.2%}")

            return text_results

        except Exception as e:
            print(f"❌ Image-based PDF processing failed: {e}")
            return self._fallback_ocr(pdf_path)

    def _preprocess_image(self, image_np):
        """Advanced image preprocessing for better OCR"""

        # Convert to grayscale
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_np

        # Noise reduction
        denoised = cv2.fastNlMeansDenoising(gray)

        # Contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)

        # Thresholding
        _, thresh = cv2.threshold(
            enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )

        # Deskew
        angle = self._compute_skew(thresh)
        if abs(angle) > 0.5:
            return self._rotate_image(thresh, angle)

        return thresh

    def _compute_skew(self, image):
        """Compute skew angle for deskewing"""
        edges = cv2.Canny(image, 50, 150, apertureSize=3)
        lines = cv2.HoughLinesP(
            edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10
        )

        if lines is None:
            return 0

        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
            if abs(angle) < 45:
                angles.append(angle)

        return np.median(angles) if angles else 0

    def _rotate_image(self, image, angle):
        """Rotate image by given angle"""
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        return cv2.warpAffine(
            image,
            M,
            (w, h),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE
        )

    def _fallback_ocr(self, file_path):
        """Fallback OCR method with Datadog metrics"""
        try:
            text = ""
            if file_path.lower().endswith('.pdf'):
                images = pdf2image.convert_from_path(file_path)
                for img in images:
                    text += pytesseract.image_to_string(img) + "\n"
            else:
                text = pytesseract.image_to_string(Image.open(file_path))

            lines = text.split('\n')
            text_results = []

            for i, line in enumerate(lines):
                if line.strip():
                    text_results.append({
                        'page': 1,
                        'line': i + 1,
                        'text': line.strip(),
                        'type': 'ocr_fallback',
                        'confidence': 0.5
                    })

            # 🎯 DATADOG METRICS: Fallback OCR confidence
            gauge("govdoc.ocr.confidence", 0.5, tags=["source:fallback"])
            gauge("govdoc.ocr.document_confidence", 0.5, tags=["source:fallback"])
            
            print(f"⚠️ Fallback OCR used - confidence set to 0.5")
            
            return text_results

        except Exception:
            return []
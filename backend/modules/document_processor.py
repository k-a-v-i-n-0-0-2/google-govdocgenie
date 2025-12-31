# ==================== modules/document_processor.py (UPDATED WITH DEBUG) ====================
import pdfplumber
import re
from datetime import datetime
import os
from config import Config
from modules.advanced_ocr import AdvancedOCRProcessor

class DocumentProcessor:
    def __init__(self):
        self.config = Config()
        self.ocr_processor = AdvancedOCRProcessor()
        
    def extract_all_text(self, file_path):
        """HYBRID extraction: Try PDF text first, then OCR for image-based PDFs"""
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return []
        
        file_ext = os.path.splitext(file_path)[1].lower()
        
        # Handle PDF files
        if file_ext == '.pdf':
            return self._hybrid_pdf_extraction(file_path)
        
        # Handle image files
        elif file_ext in ['.png', '.jpg', '.jpeg']:
            return self._extract_from_image(file_path)
        
        else:
            print(f"⚠️ Unsupported file type: {file_ext}")
            return []
    
    def _hybrid_pdf_extraction(self, pdf_path):
        """Hybrid PDF extraction: text + OCR for image-based"""
        
        text_data = []
        
        # First attempt: Extract text using pdfplumber
        text_data = self._extract_text_from_pdf(pdf_path)
        
        # Check if we got enough text
        total_text = sum(len(item['text']) for item in text_data)
        
        # If insufficient text (< 100 chars), likely an image-based PDF
        if total_text < 100:
            print(f"  ⚠️ Low text extraction ({total_text} chars), using OCR...")
            ocr_data = self.ocr_processor.extract_from_image_based_pdf(pdf_path)
            
            if ocr_data and len(ocr_data) > 0:
                print(f"  ✅ OCR extracted {len(ocr_data)} elements")
                return ocr_data
            else:
                print(f"  ⚠️ OCR also failed, using fallback")
                return self._fallback_extraction(pdf_path)
        
        print(f"  ✅ Text-based PDF: Extracted {len(text_data)} elements")
        return text_data
    
    def _extract_text_from_pdf(self, pdf_path):
        """Extract text from regular PDF"""
        text_data = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    
                    if page_text:
                        lines = page_text.split('\n')
                        for line_num, line in enumerate(lines, 1):
                            if line.strip():
                                text_data.append({
                                    'page': page_num,
                                    'line': line_num,
                                    'text': line.strip(),
                                    'type': 'text',
                                    'confidence': 1.0
                                })
                    
                    # Extract tables
                    tables = page.extract_tables()
                    if tables:
                        for table_num, table in enumerate(tables, 1):
                            for row_num, row in enumerate(table, 1):
                                row_text = ' '.join([str(cell) for cell in row if cell])
                                if row_text.strip():
                                    text_data.append({
                                        'page': page_num,
                                        'line': f"table{table_num}_row{row_num}",
                                        'text': row_text.strip(),
                                        'type': 'table',
                                        'confidence': 1.0
                                    })
        except Exception as e:
            print(f"  ⚠️ pdfplumber error: {e}")
        
        return text_data
    
    def _extract_from_image(self, image_path):
        """Extract text from image file"""
        print(f"  Processing image: {os.path.basename(image_path)}")
        
        try:
            from PIL import Image
            import pytesseract
            
            # Open and process image
            img = Image.open(image_path)
            
            # Extract text with details
            ocr_data = pytesseract.image_to_data(
                img, 
                output_type=pytesseract.Output.DICT,
                config='--psm 6'
            )
            
            text_data = []
            n_boxes = len(ocr_data['text'])
            for i in range(n_boxes):
                text = ocr_data['text'][i].strip()
                conf = int(ocr_data['conf'][i])
                
                if text and conf > 30:
                    text_data.append({
                        'page': 1,
                        'line': ocr_data['line_num'][i],
                        'text': text,
                        'type': 'image_ocr',
                        'confidence': conf / 100.0
                    })
            
            print(f"  ✅ Extracted {len(text_data)} text elements from image")
            return text_data
            
        except Exception as e:
            print(f"  ❌ Image processing failed: {e}")
            return []
    
    def _fallback_extraction(self, file_path):
        """Final fallback extraction"""
        try:
            # Try PyPDF2 as last resort
            import PyPDF2
            
            text = ""
            with open(file_path, 'rb') as f:
                pdf = PyPDF2.PdfReader(f)
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
            
            lines = text.split('\n')
            text_data = []
            for i, line in enumerate(lines):
                if line.strip():
                    text_data.append({
                        'page': 1,
                        'line': i + 1,
                        'text': line.strip(),
                        'type': 'fallback',
                        'confidence': 0.3
                    })
            
            return text_data
            
        except:
            return []
    
    def find_pattern(self, text_data, pattern, field_name, flags=re.IGNORECASE, debug=False):
        """Find patterns in text data with debug output"""
        results = []
        compiled_pattern = re.compile(pattern, flags)
        
        if debug:
            print(f"    Looking for {field_name} with pattern: {pattern}")
            print(f"    Text to search: {' '.join([item['text'][:50] for item in text_data])}")
        
        for item in text_data:
            text = item['text']
            matches = compiled_pattern.findall(text)
            
            for match in matches:
                match_str = match if isinstance(match, str) else match[0]
                
                # Don't add duplicates
                if not any(r['value'] == match_str for r in results):
                    results.append({
                        'field': field_name,
                        'value': match_str,
                        'page': item['page'],
                        'line': item['line'],
                        'snippet': text[:100],
                        'confidence': item.get('confidence', 1.0)
                    })
        
        if debug and not results:
            print(f"    No {field_name} found in text")
            # Try to find similar patterns
            self._debug_find_similar(text_data, field_name)
        
        return results
    
    def _debug_find_similar(self, text_data, field_name):
        """Find similar patterns for debugging"""
        all_text = ' '.join([item['text'] for item in text_data])
        
        if 'gst' in field_name.lower():
            # Look for GST-like patterns
            gst_like = re.findall(r'[0-9]{2}[A-Z0-9]{13}', all_text)
            if gst_like:
                print(f"    Found GST-like patterns: {gst_like[:3]}")
            
            # Look for GST text
            if 'gst' in all_text.lower():
                print(f"    'GST' text found in document")
        
        elif 'pan' in field_name.lower():
            # Look for PAN-like patterns
            pan_like = re.findall(r'[A-Z]{5}[0-9]{4}[A-Z]', all_text)
            if pan_like:
                print(f"    Found PAN-like patterns: {pan_like[:3]}")
            
            if 'pan' in all_text.lower():
                print(f"    'PAN' text found in document")
        
        elif 'udyam' in field_name.lower():
            # Look for Udyam-like patterns
            if 'udyam' in all_text.lower():
                print(f"    'Udyam' text found in document")
            
            # Look for registration numbers
            reg_like = re.findall(r'[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{7}', all_text)
            if reg_like:
                print(f"    Found registration-like patterns: {reg_like[:3]}")
    
    def extract_company_names(self, text_data):
        """Extract company names"""
        patterns = [
            r'(?:M/s\.?\s*)?([A-Z][A-Za-z\s&]{3,}(?:Pvt\.?\s*Ltd\.?|Private\s+Limited|Limited|LLP|LLC))',
            r'Company\s*Name\s*[:]?\s*([A-Z][A-Za-z\s&]{3,})',
            r'Business\s*Name\s*[:]?\s*([A-Z][A-Za-z\s&]{3,})',
            r'Name\s*[:]?\s*([A-Z][A-Za-z\s&]{3,})'
        ]
        
        names = []
        for pattern in patterns:
            matches = self.find_pattern(text_data, pattern, 'company_name')
            names.extend(matches)
        
        return names
    
    def extract_dates(self, text_data):
        """Extract dates"""
        date_patterns = [
            r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}',
            r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}',
            r'\d{4}[-/]\d{1,2}[-/]\d{1,2}'
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = self.find_pattern(text_data, pattern, 'date')
            dates.extend(matches)
        
        return dates
    
    def extract_prices(self, text_data):
        """Extract prices"""
        price_patterns = [
            r'₹\s*[\d,]+(?:\.\d{2})?',
            r'Rs\.?\s*[\d,]+(?:\.\d{2})?',
            r'INR\s*[\d,]+(?:\.\d{2})?',
            r'Total\s*[:]?\s*[\d,]+(?:\.\d{2})?',
            r'\$\s*[\d,]+(?:\.\d{2})?',
            r'[\d,]+(?:\.\d{2})?\s*(?:USD|EUR|GBP)'
        ]
        
        prices = []
        for pattern in price_patterns:
            matches = self.find_pattern(text_data, pattern, 'price')
            prices.extend(matches)
        
        return prices
    
    def debug_extracted_text(self, text_data, doc_type):
        """Show debug info about extracted text"""
        print(f"\n    🔍 DEBUG EXTRACTED TEXT FOR {doc_type}:")
        print(f"    {'-'*50}")
        
        if not text_data:
            print(f"    ❌ NO TEXT EXTRACTED")
            return
        
        # Show sample of extracted text
        print(f"    First 10 text elements:")
        for i, item in enumerate(text_data[:10]):
            print(f"      {i+1}. Page {item['page']}, Line {item['line']}: {item['text'][:80]}...")
        
        # Show all extracted text combined
        all_text = ' '.join([item['text'] for item in text_data])
        print(f"\n    All text combined (first 500 chars):")
        print(f"    {all_text[:500]}...")
        
        print(f"    {'-'*50}")
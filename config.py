# ==================== config.py ====================
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    
    # Paths
    UPLOAD_FOLDER = 'uploads'
    OUTPUT_FOLDER = 'outputs'
    SAMPLE_DOCS_FOLDER = 'documents'
    MODELS_FOLDER = 'models'
    TRAINING_DATA_FOLDER = 'training_data'
    
    # File settings
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
    MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB
    
    # Updated validation patterns (using your exact patterns)
    GST_PATTERN = r'\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b'
    PAN_PATTERN = r'\b[A-Z]{5}[0-9]{4}[A-Z]\b'
    UDYAM_PATTERN = r'\bUDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{6,7}\b'
    QUOTATION_DATE_PATTERN = r'\b(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-](19|20)\d{2}\b'
    PRICE_PATTERN = r'\b(INR|Rs\.?)\s?[0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?\b'
    COMPANY_NAME_PATTERN = r'\b[A-Z][A-Za-z0-9&\s\.-]{2,}?(?:Pvt\.?\sLtd|Private\sLimited|LLP|Limited)\b'
    SIGNATURE_PATTERN = r'\b(signature|signed|authorized\s+signatory|digitally\s+signed|director|proprietor)\b'
    
    # Valid GST state codes
    VALID_GST_STATE_CODES = [
        '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
        '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
        '21', '22', '23', '24', '26', '27', '28', '29', '30', '31',
        '32', '33', '34', '35', '36', '37'
    ]
    
    # Certificate validity
    UDYAM_VALIDITY_DAYS = 365 * 5  # 5 years
    GST_VALIDITY_DAYS = 365  # 1 year
    
    # Required fields
    REQUIRED_FIELDS = [
        'gst_number', 'pan_number', 'udyam_number',
        'company_name', 'signature', 'quotation_date'
    ]
    
    # Field weights for scoring
    FIELD_WEIGHTS = {
        'gst_number': 25,
        'pan_number': 20,
        'udyam_number': 15,
        'signature': 15,
        'company_name': 10,
        'quotation_date': 10,
        'quotation_price': 5
    }
    
    # Thresholds
    APPROVAL_THRESHOLD = 85
    NEEDS_REVIEW_THRESHOLD = 60
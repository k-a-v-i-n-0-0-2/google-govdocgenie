import re
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from config import Config

class ComplianceChecker:
    def __init__(self):
        self.config = Config()
        
    def validate_gst(self, gst_number):
        """Complete GST validation"""
        if not gst_number:
            return {'valid': False, 'error': 'Empty GST'}
        
        gst_number = str(gst_number).strip().upper()
        
        if len(gst_number) != 15:
            return {'valid': False, 'error': f'GST must be 15 chars, got {len(gst_number)}'}
        
        if not re.match(self.config.GST_PATTERN, gst_number):
            return {'valid': False, 'error': 'Invalid GST format'}
        
        state_code = gst_number[:2]
        if state_code not in self.config.VALID_GST_STATE_CODES:
            return {'valid': False, 'error': f'Invalid state code: {state_code}'}
        
        pan_portion = gst_number[2:12]
        pan_check = self.validate_pan(pan_portion)
        if not pan_check['valid']:
            return {'valid': False, 'error': 'Invalid PAN in GST'}
        
        return {
            'valid': True,
            'message': 'GST valid',
            'state_code': state_code,
            'pan': pan_portion
        }
    
    def validate_pan(self, pan_number):
        """Complete PAN validation"""
        if not pan_number:
            return {'valid': False, 'error': 'Empty PAN'}
        
        pan_number = str(pan_number).strip().upper()
        
        if len(pan_number) != 10:
            return {'valid': False, 'error': f'PAN must be 10 chars, got {len(pan_number)}'}
        
        if not re.match(self.config.PAN_PATTERN, pan_number):
            return {'valid': False, 'error': 'Invalid PAN format'}
        
        if not pan_number[:5].isalpha():
            return {'valid': False, 'error': 'First 5 must be letters'}
        
        if not pan_number[5:9].isdigit():
            return {'valid': False, 'error': 'Chars 6-9 must be digits'}
        
        if not pan_number[9].isalpha():
            return {'valid': False, 'error': 'Last char must be letter'}
        
        return {'valid': True, 'message': 'PAN valid'}
    
    def validate_udyam(self, udyam_number):
        """Complete Udyam validation"""
        if not udyam_number:
            return {'valid': False, 'error': 'Empty Udyam'}
        
        udyam_number = str(udyam_number).strip().upper()
        
        if not re.match(self.config.UDYAM_PATTERN, udyam_number, re.IGNORECASE):
            return {'valid': False, 'error': 'Invalid Udyam format'}
        
        parts = udyam_number.split('-')
        if len(parts) != 4:
            return {'valid': False, 'error': 'Invalid Udyam structure'}
        
        return {
            'valid': True,
            'message': 'Udyam valid',
            'state': parts[1],
            'district': parts[2]
        }
    
    def check_date_validity(self, date_str, cert_type):
        """Enhanced date validation"""
        if not date_str:
            return {'valid': False, 'error': 'No date'}
        
        date_formats = [
            '%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d',
            '%d %b %Y', '%d %B %Y', '%B %d, %Y'
        ]
        
        cert_date = None
        for fmt in date_formats:
            try:
                cert_date = datetime.strptime(str(date_str).strip(), fmt)
                break
            except:
                continue
        
        if not cert_date:
            return {'valid': False, 'error': 'Cannot parse date'}
        
        today = datetime.now()
        validity_days = (
            self.config.UDYAM_VALIDITY_DAYS if cert_type.lower() == 'udyam'
            else self.config.GST_VALIDITY_DAYS
        )
        
        expiry = cert_date + timedelta(days=validity_days)
        days_left = (expiry - today).days
        
        if days_left < 0:
            return {
                'valid': False,
                'error': f'Expired {abs(days_left)} days ago',
                'expiry_date': expiry.strftime('%d-%m-%Y')
            }
        
        return {
            'valid': True,
            'message': f'Valid for {days_left} days',
            'expiry_date': expiry.strftime('%d-%m-%Y'),
            'days_remaining': days_left
        }
    
    def check_name_consistency(self, names_list):
        """Fuzzy name matching"""
        if not names_list or len(names_list) < 2:
            return {'consistent': True, 'message': 'Single name'}
        
        def clean_name(name):
            name = str(name).lower().strip()
            replacements = {
                'pvt ltd': 'private limited',
                'pvt. ltd.': 'private limited',
                'llp': 'limited liability partnership'
            }
            for old, new in replacements.items():
                name = name.replace(old, new)
            return re.sub(r'[^\w\s]', '', name)
        
        cleaned = [clean_name(n) for n in names_list if n]
        base = cleaned[0]
        
        for name in cleaned[1:]:
            similarity = SequenceMatcher(None, base, name).ratio()
            if similarity < 0.75:
                return {
                    'consistent': False,
                    'error': 'Name mismatch',
                    'similarity': similarity
                }
        
        return {'consistent': True, 'message': 'Names match'}
    
    def check_gst_pan_consistency(self, gst, pan):
        """Verify PAN in GST matches PAN card"""
        if not gst or not pan:
            return {'consistent': False, 'error': 'Missing GST or PAN'}
        
        gst = str(gst).strip().upper()
        pan = str(pan).strip().upper()
        
        if len(gst) >= 12:
            gst_pan = gst[2:12]
        else:
            return {'consistent': False, 'error': 'Invalid GST'}
        
        if gst_pan == pan:
            return {'consistent': True, 'message': 'PAN matches'}
        else:
            return {
                'consistent': False,
                'error': 'PAN mismatch',
                'gst_pan': gst_pan,
                'pan': pan
            }
    
    def check_signature_presence(self, text_data):
        """Signature detection with confidence"""
        keywords = [
            'signature', 'signed', 'authorized signatory',
            'director', 'proprietor', 'for and on behalf'
        ]
        
        evidence = []
        for item in text_data:
            text_lower = item['text'].lower()
            for keyword in keywords:
                if keyword in text_lower:
                    evidence.append({
                        'keyword': keyword,
                        'page': item['page'],
                        'line': item['line'],
                        'snippet': item['text'][:100]
                    })
        
        if evidence:
            confidence = min(1.0, len(evidence) * 0.3)
            return {
                'found': True,
                'confidence': confidence,
                'evidence': evidence,
                'count': len(evidence)
            }
        
        return {'found': False, 'error': 'No signature', 'confidence': 0.0}
    
    def calculate_completeness_score(self, extracted_data, required=None):
        """Calculate completeness percentage"""
        if required is None:
            required = self.config.REQUIRED_FIELDS
        
        present = sum(1 for f in required if f in extracted_data and extracted_data[f])
        total = len(required)
        score = (present / total) * 100 if total > 0 else 0
        
        missing = [f for f in required if f not in extracted_data or not extracted_data[f]]
        
        return {
            'score': score,
            'present': present,
            'total': total,
            'missing_fields': missing,
            'percentage': f"{score:.1f}%"
        }

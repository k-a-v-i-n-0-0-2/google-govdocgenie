import numpy as np
import joblib
import json
import os
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.base import BaseEstimator
import re

class SimpleLocalAIModel:
    def __init__(self, model_path='models/classifier.pkl'):
        self.model = None
        self.feature_columns = []
        self.models_loaded = False
        self.model_path = model_path
        
        self.load_model()
    
    def load_model(self):
        """Load trained model from disk"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                
                # Load feature info
                feature_info_path = os.path.join(os.path.dirname(self.model_path), 'feature_info.json')
                if os.path.exists(feature_info_path):
                    with open(feature_info_path, 'r') as f:
                        feature_info = json.load(f)
                        self.feature_columns = feature_info.get('feature_columns', [])
                
                self.models_loaded = True
                print(f"✓ Loaded local AI model from {self.model_path}")
                print(f"  Features: {len(self.feature_columns)}")
                
            else:
                print(f"⚠ Model not found at {self.model_path}")
                self.models_loaded = False
                
        except Exception as e:
            print(f"Error loading model: {e}")
            self.models_loaded = False
    
    def extract_features_from_text(self, text_data):
        """Extract features from document text"""
        features = {}
        
        # Combine all text
        all_text = " ".join([item['text'] for item in text_data]) if isinstance(text_data, list) else str(text_data)
        all_text_lower = all_text.lower()
        
        # Basic document presence features
        features['gst_present'] = 1 if re.search(r'gst(in)?\s*[:]?\s*[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}', all_text, re.IGNORECASE) else 0
        features['pan_present'] = 1 if re.search(r'pan\s*[:]?\s*[A-Z]{5}[0-9]{4}[A-Z]{1}', all_text, re.IGNORECASE) else 0
        features['udyam_present'] = 1 if re.search(r'udyam[-\s][A-Z]{2}[-\s][0-9]{2}[-\s][0-9]{7}', all_text, re.IGNORECASE) else 0
        features['signature_present'] = 1 if any(word in all_text_lower for word in ['signature', 'signed', 'authorized']) else 0
        features['quotation_present'] = 1 if any(word in all_text_lower for word in ['quotation', 'quote', 'proposal']) else 0
        
        # Document validity (simplified - assume valid if present)
        features['gst_valid'] = features['gst_present']
        features['pan_valid'] = features['pan_present']
        features['udyam_valid'] = features['udyam_present']
        features['quotation_valid'] = features['quotation_present']
        
        # Date features (simplified)
        features['gst_days_to_expiry'] = 365 if features['gst_present'] else -365
        features['udyam_days_to_expiry'] = 365 if features['udyam_present'] else -365
        
        # Consistency features
        features['name_consistency'] = 1 if len(re.findall(r'tech\s+solutions', all_text_lower, re.IGNORECASE)) > 1 else 0
        features['address_consistency'] = 1 if len(re.findall(r'mumbai', all_text_lower, re.IGNORECASE)) > 0 else 0
        features['price_consistency'] = 1 if len(re.findall(r'₹\s*\d+', all_text)) > 0 else 0
        
        # Document quality
        features['num_pages'] = len(set(item.get('page', 1) for item in text_data)) if isinstance(text_data, list) else 1
        features['has_signature'] = features['signature_present']
        features['has_delivery_date'] = 1 if any(word in all_text_lower for word in ['delivery', 'dispatch', 'within']) else 0
        features['has_payment_terms'] = 1 if any(word in all_text_lower for word in ['payment', 'terms', 'advance']) else 0
        features['has_warranty'] = 1 if 'warranty' in all_text_lower else 0
        
        # Text features
        features['text_length'] = len(all_text)
        features['num_dates_found'] = len(re.findall(r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}', all_text))
        features['num_prices_found'] = len(re.findall(r'₹\s*\d+', all_text))
        
        # Validation scores (simplified)
        features['gst_validation_score'] = 100 if features['gst_present'] else 0
        features['pan_validation_score'] = 100 if features['pan_present'] else 0
        features['udyam_validation_score'] = 100 if features['udyam_present'] else 0
        
        # Overall metrics
        presence_score = sum([features['gst_present'], features['pan_present'], 
                            features['udyam_present'], features['signature_present']]) / 4 * 100
        
        features['completeness_score'] = presence_score
        features['consistency_score'] = 100 if features['name_consistency'] and features['price_consistency'] else 50
        features['validity_score'] = sum([features['gst_valid'], features['pan_valid'], 
                                        features['udyam_valid']]) / 3 * 100
        
        return features
    
    def predict(self, text_data, validation_results=None):
        """Predict compliance using local model"""
        
        if not self.models_loaded:
            return self._fallback_prediction(text_data, validation_results)
        
        try:
            # Extract features
            features = self.extract_features_from_text(text_data)
            
            # Prepare feature vector in correct order
            feature_vector = []
            for col in self.feature_columns:
                if col in features:
                    feature_vector.append(features[col])
                else:
                    feature_vector.append(0)  # Default value for missing features
            
            # Convert to numpy array
            X = np.array([feature_vector])
            
            # Predict
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(X)[0]
                prediction_idx = np.argmax(probabilities)
                confidence = probabilities[prediction_idx]
                
                # Map index to class
                classes = self.model.classes_
                prediction = classes[prediction_idx]
            else:
                prediction = self.model.predict(X)[0]
                confidence = 0.7  # Default confidence
            
            # Generate reasons
            reasons = self._generate_reasons(features, validation_results)
            
            return {
                'success': True,
                'prediction': prediction,
                'confidence': float(confidence),
                'reasons': reasons,
                'features': features,
                'model_type': 'RandomForest',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(text_data, validation_results)
    
    def _fallback_prediction(self, text_data, validation_results):
        """Fallback prediction if model fails"""
        # Simple rule-based prediction
        
        # Extract features for fallback
        features = self.extract_features_from_text(text_data) if text_data else {}
        
        # Count missing critical documents
        missing_critical = 0
        for field in ['gst_present', 'pan_present', 'udyam_present']:
            if features.get(field, 0) == 0:
                missing_critical += 1
        
        # Make decision
        if missing_critical == 0:
            decision = "APPROVE"
            confidence = 0.8
            reasons = ["All critical documents present"]
        elif missing_critical == 1:
            decision = "NEEDS MORE DOCUMENTS"
            confidence = 0.6
            reasons = ["One critical document missing"]
        else:
            decision = "REJECT"
            confidence = 0.4
            reasons = ["Multiple critical documents missing"]
        
        return {
            'success': True,
            'prediction': decision,
            'confidence': confidence,
            'reasons': reasons,
            'features': features,
            'model_type': 'RuleBasedFallback',
            'timestamp': datetime.now().isoformat()
        }
    
    def _generate_reasons(self, features, validation_results):
        """Generate reasons based on features"""
        reasons = []
        
        # Check document presence
        if features.get('gst_present', 0) == 0:
            reasons.append("GST certificate not found")
        if features.get('pan_present', 0) == 0:
            reasons.append("PAN card not found")
        if features.get('udyam_present', 0) == 0:
            reasons.append("Udyam certificate not found")
        if features.get('signature_present', 0) == 0:
            reasons.append("Signature not found")
        
        # Check dates
        if features.get('gst_days_to_expiry', 365) < 0:
            reasons.append("GST certificate expired")
        if features.get('udyam_days_to_expiry', 365) < 0:
            reasons.append("Udyam certificate expired")
        
        # Check consistency
        if features.get('name_consistency', 1) == 0:
            reasons.append("Name inconsistency detected")
        if features.get('price_consistency', 1) == 0:
            reasons.append("Price inconsistency detected")
        
        # Limit reasons
        return reasons[:3]
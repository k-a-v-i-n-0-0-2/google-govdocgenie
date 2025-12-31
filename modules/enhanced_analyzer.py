# ==================== modules/enhanced_analyzer.py ====================
import google.generativeai as genai
import json
import os
from datetime import datetime
from config import Config
from modules.local_ai_model import SimpleLocalAIModel

class EnhancedAIAnalyzer:
    def __init__(self):
        self.config = Config()
        self.local_model = SimpleLocalAIModel()
        self.gemini_available = False
        self.initialize_gemini()
        
    def initialize_gemini(self):
        """Initialize Gemini API if available"""
        try:
            api_key = self.config.GEMINI_API_KEY
            if api_key and api_key.strip():
                genai.configure(api_key=api_key)
                self.gemini_available = True
                print("✅ Gemini AI API initialized")
            else:
                print("⚠️ Gemini API key not found, using local model only")
        except Exception as e:
            print(f"⚠️ Gemini initialization failed: {e}")
    
    def analyze_compliance(self, extracted_data, validation_results, text_data):
        """Enhanced AI analysis with cross-checking"""
        
        print("🤖 Running enhanced AI analysis...")
        
        # Step 1: Local model prediction
        local_result = self.local_model.predict(text_data, validation_results)
        
        result = {
            'success': local_result['success'],
            'analysis': {
                'decision': local_result['prediction'],
                'confidence': local_result['confidence'],
                'reasons': local_result['reasons'],
                'summary': self._generate_summary(local_result['prediction'], validation_results),
                'model_type': local_result['model_type'],
                'analysis_source': 'local_model',
                'timestamp': datetime.now().isoformat()
            }
        }
        
        # Step 2: If Gemini available, cross-check
        if self.gemini_available and self._should_use_gemini(local_result):
            gemini_result = self._gemini_cross_check(extracted_data, validation_results, text_data)
            
            if gemini_result and gemini_result.get('success'):
                result['analysis']['gemini_decision'] = gemini_result['decision']
                result['analysis']['gemini_confidence'] = gemini_result['confidence']
                result['analysis']['gemini_reasons'] = gemini_result['reasons']
                result['analysis']['analysis_source'] = 'cross_checked'
                
                # If both agree, use higher confidence
                if gemini_result['decision'] == local_result['prediction']:
                    result['analysis']['confidence'] = max(
                        local_result['confidence'], 
                        gemini_result['confidence']
                    )
        
        # Step 3: Add recommendations
        result['analysis']['recommendations'] = self._generate_recommendations(
            result['analysis']['decision'], 
            validation_results
        )
        
        return result
    
    def _should_use_gemini(self, local_result):
        """Determine if Gemini cross-check is needed"""
        # Use Gemini for low confidence or borderline cases
        if local_result['confidence'] < 0.8:
            return True
        
        # Use Gemini for "NEEDS MORE DOCUMENTS" cases
        if local_result['prediction'] == "NEEDS MORE DOCUMENTS":
            return True
            
        return False
    
    def _gemini_cross_check(self, extracted_data, validation_results, text_data):
        """Cross-check with Gemini AI using government sources"""
        
        try:
            # Prepare context for Gemini with STRICT constraints
            context = """
            You are a government compliance verification assistant.

            STRICT CONSTRAINTS (NON-NEGOTIABLE):
            1. You must ONLY use the government website content explicitly provided to you.
            2. Allowed sources are LIMITED to:
               - https://www.gem.gov.in
               - https://www.gst.gov.in
               - https://udyamregistration.gov.in
            3. You must NOT use any other knowledge, memory, training data, or assumptions.
            4. You must NOT rely on blogs, forums, Reddit, StackOverflow, or unofficial sources.
            5. If a rule or requirement is NOT found in the provided website content, respond exactly with:
               "RULE NOT FOUND IN PROVIDED GOVERNMENT SOURCES".
            6. Do NOT guess. Do NOT infer. Do NOT hallucinate.
            7. Your role is advisory only. Final compliance decisions are handled by the system.

            Your task:
            - Verify extracted document data ONLY against the provided government website content.
            - Clearly state PASS or FAIL.
            - Quote or reference the relevant provided content in your explanation.
            """
            
            # Prepare document data
            doc_summary = self._create_document_summary(extracted_data, validation_results)
            
            prompt = f"""
            {context}
            
            DOCUMENT DATA TO VERIFY:
            {json.dumps(doc_summary, indent=2)}
            
            VERIFICATION REQUEST:
            1. Check if all required documents are present as per government tender requirements.
            2. Verify document validity based on government standards.
            3. Check for any discrepancies or inconsistencies.
            4. Return your assessment in this JSON format:
            {{
                "decision": "APPROVE/NEEDS MORE DOCUMENTS/REJECT",
                "confidence": 0.0-1.0,
                "reasons": ["list of reasons"],
                "verification_method": "government_source_verification",
                "sources_checked": ["list of government sources checked"]
            }}
            
            IMPORTANT: Only use the government sources listed in constraints.
            """
            
            # Call Gemini
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            
            # Parse response
            try:
                # Try to extract JSON from response
                text = response.text
                if '```json' in text:
                    json_str = text.split('```json')[1].split('```')[0].strip()
                elif '```' in text:
                    json_str = text.split('```')[1].strip()
                else:
                    json_str = text.strip()
                
                result = json.loads(json_str)
                
                # Validate result format
                required_keys = ['decision', 'confidence', 'reasons']
                if all(key in result for key in required_keys):
                    return {
                        'success': True,
                        'decision': result['decision'],
                        'confidence': float(result['confidence']),
                        'reasons': result['reasons']
                    }
                    
            except Exception as e:
                print(f"⚠️ Gemini response parsing failed: {e}")
                
            # Fallback: Extract decision from text
            text_lower = response.text.lower()
            if 'approve' in text_lower:
                decision = 'APPROVE'
            elif 'needs more documents' in text_lower or 'incomplete' in text_lower:
                decision = 'NEEDS MORE DOCUMENTS'
            elif 'reject' in text_lower:
                decision = 'REJECT'
            else:
                decision = 'NEEDS MORE DOCUMENTS'
            
            return {
                'success': True,
                'decision': decision,
                'confidence': 0.7,
                'reasons': ['Gemini cross-check completed']
            }
            
        except Exception as e:
            print(f"❌ Gemini cross-check failed: {e}")
            return None
    
    def _create_document_summary(self, extracted_data, validation_results):
        """Create summary for AI analysis"""
        summary = {
            'documents_found': [],
            'validation_status': {},
            'missing_items': [],
            'issues_detected': []
        }
        
        # List found documents
        for doc_type in ['gst', 'pan', 'udyam', 'quotation']:
            if any(doc_type in key.lower() for key in extracted_data.keys()):
                summary['documents_found'].append(doc_type.upper())
        
        # Add validation status
        for field, result in validation_results.items():
            if isinstance(result, dict):
                status = result.get('status', 'unknown')
                if 'valid' in result:
                    status = 'valid' if result['valid'] else 'invalid'
                summary['validation_status'][field] = status
        
        # Find issues
        for field, result in validation_results.items():
            if isinstance(result, dict):
                if result.get('valid', True) == False:
                    summary['issues_detected'].append(f"{field}: {result.get('error', 'Invalid')}")
                if 'consistent' in result and result['consistent'] == False:
                    summary['issues_detected'].append(f"{field}: Inconsistent")
        
        return summary
    
    def _generate_summary(self, decision, validation_results):
        """Generate human-readable summary"""
        if decision == "APPROVE":
            return "✅ All documents are compliant and ready for submission. All validations passed."
        elif decision == "NEEDS MORE DOCUMENTS":
            issues = []
            for field, result in validation_results.items():
                if isinstance(result, dict) and not result.get('valid', True):
                    issues.append(field)
            return f"⚠️ {len(issues)} issues need attention. Documents require additional verification."
        else:  # REJECT
            return "❌ Multiple critical issues found. Documents do not meet compliance requirements."
    
    def _generate_recommendations(self, decision, validation_results):
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if decision == "APPROVE":
            recommendations.extend([
                "Proceed with submission",
                "Keep copies of all validated documents",
                "Verify submission deadlines"
            ])
        elif decision == "NEEDS MORE DOCUMENTS":
            recommendations.extend([
                "Provide missing documents",
                "Verify document expiry dates",
                "Ensure signature is present on all documents"
            ])
        else:  # REJECT
            recommendations.extend([
                "Review all document requirements",
                "Contact support for clarification",
                "Resubmit with corrected documents"
            ])
        
        return recommendations
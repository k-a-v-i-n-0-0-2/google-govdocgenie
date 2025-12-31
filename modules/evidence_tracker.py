# ==================== modules/evidence_tracker.py (COMPLETE WITH DATADOG) ====================

from datetime import datetime
from config import Config

# 🎯 DATADOG METRICS
from modules.datadog_client import increment, gauge


class EvidenceTracker:
    """Evidence tracking with Datadog observability"""
    
    def __init__(self):
        self.config = Config()
        self.evidence = {}
        self.mismatches = []
        
    def add_evidence(self, field_name, value, page, line, snippet, status="found"):
        """
        Record evidence for a field with Datadog tracking.
        
        Args:
            field_name: Field being tracked (e.g., 'gst_number')
            value: Extracted value
            page: Page number
            line: Line number
            snippet: Text snippet
            status: Status ('found', 'valid', 'invalid')
        """
        if field_name not in self.evidence:
            self.evidence[field_name] = []
        
        self.evidence[field_name].append({
            'value': value,
            'page': page,
            'line': line,
            'snippet': snippet[:150],
            'status': status,
            'timestamp': datetime.now().isoformat()
        })
        
        # 🎯 DATADOG METRIC: Track evidence generation (MANDATORY)
        increment("govdoc.evidence.generated", 
                  tags=[f"field:{field_name}", f"status:{status}"])
    
    def add_mismatch(self, field_name, expected, found, location):
        """Record a mismatch with Datadog tracking"""
        severity = self._calculate_severity(field_name)
        
        self.mismatches.append({
            'field': field_name,
            'expected': str(expected)[:100],
            'found': str(found)[:100],
            'location': location,
            'severity': severity,
            'timestamp': datetime.now().isoformat()
        })
        
        # 🎯 DATADOG METRIC: Track compliance mismatches
        increment("govdoc.compliance.mismatch",
                  tags=[f"field:{field_name}", f"severity:{severity}"])
    
    def _calculate_severity(self, field_name):
        """Determine severity"""
        critical = ['gst_number', 'pan_number', 'udyam_number', 'company_name']
        important = ['signature', 'date', 'price']
        
        if field_name in critical:
            return 'HIGH'
        elif field_name in important:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def generate_evidence_report(self):
        """Generate complete evidence report with Datadog metrics"""
        
        # Calculate weighted score
        total_score = 0
        max_score = sum(self.config.FIELD_WEIGHTS.values())
        
        for field, weight in self.config.FIELD_WEIGHTS.items():
            if field in self.evidence:
                evidences = self.evidence[field]
                if evidences and evidences[0]['status'] in ['found', 'valid']:
                    total_score += weight
        
        # Apply penalties for mismatches
        for mismatch in self.mismatches:
            if mismatch['severity'] == 'HIGH':
                total_score -= 15
            elif mismatch['severity'] == 'MEDIUM':
                total_score -= 10
            else:
                total_score -= 5
        
        compliance_score = max(0, min(100, (total_score / max_score) * 100))
        
        critical_issues = [m for m in self.mismatches if m['severity'] == 'HIGH']
        
        # 🎯 DATADOG METRICS: Final compliance score
        gauge("govdoc.compliance.score", compliance_score,
              tags=[f"critical_issues:{len(critical_issues)}"])
        
        gauge("govdoc.evidence.fields_found", len(self.evidence))
        gauge("govdoc.compliance.mismatches", len(self.mismatches))
        gauge("govdoc.compliance.critical_issues", len(critical_issues))
        
        report = {
            'summary': {
                'total_fields_found': len(self.evidence),
                'total_mismatches': len(self.mismatches),
                'critical_issues': len(critical_issues),
                'compliance_score': round(compliance_score, 2)
            },
            'evidence_by_field': self.evidence,
            'mismatches': self.mismatches,
            'critical_issues': critical_issues,
            'compliance_score': round(compliance_score, 2),
            'timestamp': datetime.now().isoformat()
        }
        
        return report
    
    def get_field_evidence(self, field_name):
        """Get evidence for specific field"""
        return self.evidence.get(field_name, [])
    
    def get_critical_issues(self):
        """Get only critical issues"""
        return [m for m in self.mismatches if m['severity'] == 'HIGH']
    
    def has_critical_issues(self):
        """Check if any critical issues exist"""
        return len(self.get_critical_issues()) > 0
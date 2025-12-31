from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import json
from datetime import datetime

class ReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        
    def generate_pdf_report(self, analysis_results, output_path):
        """Generate PDF compliance report"""
        
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=1  # Center
        )
        
        story.append(Paragraph("GovDoc Genie - Compliance Report", title_style))
        story.append(Spacer(1, 20))
        
        # Timestamp
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 
                              self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Decision with color
        decision = analysis_results['ai_analysis']['decision']
        decision_color = colors.green if decision == "APPROVE" else \
                        colors.orange if decision == "NEEDS MORE DOCUMENTS" else colors.red
        
        decision_style = ParagraphStyle(
            'DecisionStyle',
            parent=self.styles['Heading2'],
            textColor=decision_color,
            fontSize=18,
            spaceAfter=12
        )
        
        story.append(Paragraph(f"Decision: {decision}", decision_style))
        story.append(Spacer(1, 10))
        
        # Summary
        story.append(Paragraph("Summary:", self.styles['Heading3']))
        story.append(Paragraph(analysis_results['ai_analysis']['summary'], self.styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Reasons
        story.append(Paragraph("Key Findings:", self.styles['Heading3']))
        for reason in analysis_results['ai_analysis']['reasons']:
            story.append(Paragraph(f"• {reason}", self.styles['Normal']))
        story.append(Spacer(1, 15))
        
        # Compliance Checklist
        story.append(Paragraph("Compliance Checklist:", self.styles['Heading3']))
        
        # Prepare table data
        table_data = [['Field', 'Status', 'Value', 'Page/Line', 'Evidence']]
        
        for field, details in analysis_results['validation_results'].items():
            if isinstance(details, dict):
                status = details.get('status', 'Not Found')
                value = details.get('value', 'N/A')
                evidence = details.get('evidence', 'N/A')
                
                # Color code status
                status_color = colors.green if status.lower() == 'valid' else \
                              colors.orange if 'warning' in status.lower() else colors.red
                
                table_data.append([
                    field.replace('_', ' ').title(),
                    status,
                    str(value)[:30],
                    evidence.get('location', 'N/A') if isinstance(evidence, dict) else evidence,
                    evidence.get('snippet', 'N/A')[:50] + '...' if isinstance(evidence, dict) else evidence
                ])
        
        # Create table
        table = Table(table_data, colWidths=[1.5*inch, 1*inch, 1.5*inch, 1*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 20))
        
        # Recommendations
        if analysis_results['ai_analysis']['recommendations']:
            story.append(Paragraph("Recommendations:", self.styles['Heading3']))
            for rec in analysis_results['ai_analysis']['recommendations']:
                story.append(Paragraph(f"• {rec}", self.styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        return output_path
    
    def generate_json_report(self, analysis_results, output_path):
        """Generate JSON report"""
        
        report_data = {
            'metadata': {
                'report_type': 'compliance_analysis',
                'generated_at': datetime.now().isoformat(),
                'system_version': '1.0.0'
            },
            'decision': analysis_results['ai_analysis'],
            'validation_results': analysis_results['validation_results'],
            'extracted_data': analysis_results['extracted_data'],
            'statistics': {
                'total_fields_checked': len(analysis_results['validation_results']),
                'valid_fields': sum(1 for v in analysis_results['validation_results'].values() 
                                  if isinstance(v, dict) and v.get('status', '').lower() == 'valid'),
                'missing_fields': len(analysis_results['ai_analysis'].get('missing_fields', [])),
                'compliance_score': analysis_results.get('compliance_score', 0)
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        return output_path